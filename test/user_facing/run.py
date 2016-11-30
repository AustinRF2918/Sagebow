from subprocess import Popen

commands = [
    'python3 login.py',
    'python3 setup.py',
]

# run in parallel
processes = [Popen(cmd, shell=True) for cmd in commands]
for p in processes: p.wait()
