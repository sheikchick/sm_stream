@echo off
if not exist "venv" (
	echo Setting up virtual environment for first time...
	python -m venv venv
	venv\Scripts\pip.exe install -r requirements.txt
)
call npm install @slippi/slippi-js@6.6.1