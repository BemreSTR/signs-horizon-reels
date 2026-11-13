"""Two-pass loudnorm (-14 LUFS, TP -1.2) of timing/mix.wav and mux onto the silent render.
Usage: python3 tools/master.py E015 [seconds]   (seconds = video length, default 49.9)"""
import json, subprocess, sys
import os
comp = sys.argv[1]; dur = sys.argv[2] if len(sys.argv) > 2 else '49.9'
SUF = os.environ.get('SUFFIX', '')   # SUFFIX=_voice -> out/E020_voice.mp4 (silent render stays the input)
src = 'timing/mix.wav'
def ff(*a): return subprocess.run(['ffmpeg', '-hide_banner', '-nostats', *a], capture_output=True, text=True).stderr
e = ff('-i', src, '-af', 'loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json', '-f', 'null', '-'); j = json.loads(e[e.rfind('{'):e.rfind('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.2:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
      f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', af, '-ar', '48000', '-c:a', 'pcm_s24le', 'timing/master.wav'], check=True)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'out/{comp}_silent.mp4', '-i', 'timing/master.wav', '-map', '0:v:0', '-map', '1:a:0',
                '-c:v', 'copy', '-af', 'apad', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-t', dur, '-movflags', '+faststart', f'out/{comp}{SUF}.mp4'], check=True)
print(ff('-i', f'out/{comp}{SUF}.mp4', '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-').split('Summary:')[-1])
