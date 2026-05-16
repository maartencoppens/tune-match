from ultralytics import YOLO
import cv2
import json
import numpy as np
import platform
import time
import threading
from websocket import create_connection

model = YOLO("yolov8n.pt")

CAMERA_INDEX = 0


def open_camera():
    system_name = platform.system()

    if system_name == "Windows":
        candidates = [
            (CAMERA_INDEX, cv2.CAP_DSHOW),
            (CAMERA_INDEX, cv2.CAP_MSMF),
            (CAMERA_INDEX, None),
        ]
    elif system_name == "Darwin":
        candidates = [
            (CAMERA_INDEX, cv2.CAP_AVFOUNDATION),
            (CAMERA_INDEX, None),
        ]
    else:
        candidates = [
            (CAMERA_INDEX, None),
        ]

    for camera_index, backend in candidates:
        if backend is None:
            camera = cv2.VideoCapture(camera_index)
        else:
            camera = cv2.VideoCapture(camera_index, backend)

        if not camera.isOpened():
            camera.release()
            continue

        # Some indices open but never deliver frames (wrong device / busy camera).
        warmup_ok = False
        for _ in range(15):
            ok, frame = camera.read()
            if ok and frame is not None and frame.size > 0:
                warmup_ok = True
                break

        if warmup_ok:
            print(
                f"Camera {camera_index} opened on {system_name} "
                f"using backend {backend if backend is not None else 'default'}"
            )
            return camera

        print(
            f"Camera {camera_index} opened but no frames "
            f"(backend {backend if backend is not None else 'default'})"
        )
        camera.release()

    return None


cap = open_camera()

if cap is None:
    raise RuntimeError("Could not open the camera. Check permissions, camera index, or if another app is using it.")

ws = None

def connect_websocket():
    global ws
    try:
        ws = create_connection("ws://localhost:8080")
        print("WebSocket connected!")
        return True
    except Exception as e:
        print(f"WebSocket connection failed: {e}")
        ws = None
        return False

connect_websocket()

last_sent_zone = None
last_sent_time = 0

# ZONES LADEN

with open("zones.json", "r") as file:
    zones = json.load(file)

# KLEUREN PER ZONE

zone_colors = {
    "CENTER": (255, 255, 255),
    "RED": (0, 0, 255),
    "BLUE": (255, 0, 0),
    "GREEN": (0, 255, 0),
    "YELLOW": (0, 255, 255),
}
# CHECK IN WELKE ZONE PUNT ZIT

def get_zone(x, y):
    for zone_name, zone in zones.items():

        polygon = np.array(zone["points"], np.int32)

        inside = cv2.pointPolygonTest(
            polygon,
            (float(x), float(y)),
            False
        )

        if inside >= 0:
            return zone_name

    return "NONE"

# WEBSOCKET SEND FUNCTIE

def send_zone(zone):
    global ws
    try:
        # Try to reconnect if not connected
        if ws is None:
            print("WebSocket not connected, attempting reconnect...")
            if not connect_websocket():
                return

        payload = {
            "type": "ZONE_UPDATE",
            "zone": zone
        }

        ws.send(json.dumps(payload))

        print("Sent:", payload)

    except Exception as e:
        print(f"WebSocket error: {e}")
        ws = None
        print("Connection lost, will retry on next zone change")


# MAIN LOOP

while True:

    success, frame = cap.read()

    if not success:
        print("Camera frame kon niet gelezen worden.")
        break

    # FORCEER RESOLUTIE

    frame = cv2.resize(frame, (1920, 1080))


    # KLEINERE FRAME VOOR SNELLERE AI


    detection_frame = cv2.resize(frame, (1280, 720))


    # YOLO DETECTIE


    results = model(
        detection_frame,
        classes=[0],     # enkel personen
        conf=0.45,
        imgsz=640,
        verbose=False
    )

    active_zone = "NONE"


    # POLYGON ZONES TEKENEN


    for zone_name, zone in zones.items():

        color = zone_colors.get(zone_name, (255, 255, 255))

        points = np.array(zone["points"], np.int32)

        cv2.polylines(
            frame,
            [points],
            isClosed=True,
            color=color,
            thickness=3
        )

        cv2.putText(
            frame,
            zone_name,
            tuple(zone["points"][0]),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            color,
            2
        )


    # PERSONEN VERWERKEN


    for result in results:

        for box in result.boxes:

            # Bounding box van 1280x720 terug schalen
            x1, y1, x2, y2 = box.xyxy[0].tolist()

            scale_x = 1920 / 1280
            scale_y = 1080 / 720

            x1 *= scale_x
            y1 *= scale_y
            x2 *= scale_x
            y2 *= scale_y

            # Centerpoint berekenen
            center_x = int((x1 + x2) / 2)
            center_y = int((y1 + y2) / 2)

            # Actieve zone bepalen
            active_zone = get_zone(center_x, center_y)

            # Bounding box tekenen
            cv2.rectangle(
                frame,
                (int(x1), int(y1)),
                (int(x2), int(y2)),
                (255, 255, 255),
                2
            )

            # Centerpoint tekenen
            cv2.circle(
                frame,
                (center_x, center_y),
                8,
                (0, 255, 255),
                -1
            )

            # Tekst bij persoon
            cv2.putText(
                frame,
                f"Person - {active_zone}",
                (int(x1), int(y1) - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 255, 255),
                2
            )

            # Enkel eerste persoon gebruiken
            break

   
    # ACTIVE ZONE TEKST
   

    cv2.putText(
        frame,
        f"ACTIVE ZONE: {active_zone}",
        (30, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.2,
        (0, 255, 255),
        3
    )

   
    # WEBSOCKET STUREN
   

    current_time = time.time()

    if (
        active_zone != last_sent_zone
        and current_time - last_sent_time > 0.3
    ):

        threading.Thread(
            target=send_zone,
            args=(active_zone,),
            daemon=True
        ).start()

        last_sent_zone = active_zone
        last_sent_time = current_time

   
    # FRAME TONEN
   

    cv2.imshow("YOLO Polygon Zone Tracking", frame)

   
   
    # STOPPEN MET Q
   

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


# CLEANUP

if ws is not None:
    ws.close()
cap.release()
cv2.destroyAllWindows()