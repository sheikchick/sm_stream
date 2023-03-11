import server
import json
import subprocess


if __name__ == "__main__":
    file = server.getLatestFile(True)
    out = server.slpJS("getLatestFrame", file)
    print(out)
