import qrcode
import json

def qr_code(data):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_Q,
        box_size=43,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    image = qr.make_image(fill_color="black", back_color="white")
    image.save("qr/" + data + ".png")

qr_code("guest")
exit()
with open("static/pronouns.json") as openfile:
    data = json.load(openfile)
    for key in data.keys():
        qr_code(key)