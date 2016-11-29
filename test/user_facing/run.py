from subprocess import Popen


# run in parallel
processes = [Popen(cmd, shell=True) for cmd in commands]
for p in processes: p.wait()
