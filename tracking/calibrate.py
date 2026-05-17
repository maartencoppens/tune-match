import cv2
import json
import os

def get_camera_index():
    value = os.getenv("TRACKER_CAMERA_INDEX", "0")

    try:
        return int(value)
    except ValueError:
        print(f"Invalid TRACKER_CAMERA_INDEX={value!r}, falling back to 0")
        return 0


CAMERA_INDEX = get_camera_index()
WINDOW_NAME = "Polygon Calibration"
OUTPUT_FILE = "zones.json"

zone_names = ["CENTER", "RED", "BLUE", "GREEN", "YELLOW"]
current_zone_index = 0

zones = {}
current_points = []

colors = {
    "CENTER": (255, 255, 255),
    "RED": (0, 0, 255),
    "BLUE": (255, 0, 0),
    "GREEN": (0, 255, 0),
    "YELLOW": (0, 255, 255),
}


def save_zones():
    with open(OUTPUT_FILE, "w") as file:
        json.dump(zones, file, indent=2)

    print(f"Zones opgeslagen in {OUTPUT_FILE}")


def mouse_callback(event, x, y, flags, param):
    global current_points

    if event == cv2.EVENT_LBUTTONDOWN:
        current_points.append([x, y])
        print("Punt toegevoegd:", x, y)


cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_AVFOUNDATION)

cv2.namedWindow(WINDOW_NAME)
cv2.setMouseCallback(WINDOW_NAME, mouse_callback)

while True:
    success, frame = cap.read()

    if not success:
        print("Camera kon niet gelezen worden.")
        break

    frame = cv2.resize(frame, (1920, 1080))

    # Reeds opgeslagen zones tekenen
    for zone_name, zone in zones.items():
        color = colors[zone_name]
        points = zone["points"]

        for i in range(len(points)):
            p1 = tuple(points[i])
            p2 = tuple(points[(i + 1) % len(points)])
            cv2.line(frame, p1, p2, color, 3)

        cv2.putText(
            frame,
            zone_name,
            tuple(points[0]),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            color,
            3
        )

    # Huidige polygon tekenen
    if current_zone_index < len(zone_names):
        current_zone = zone_names[current_zone_index]
        color = colors[current_zone]

        for point in current_points:
            cv2.circle(frame, tuple(point), 7, color, -1)

        for i in range(len(current_points) - 1):
            cv2.line(
                frame,
                tuple(current_points[i]),
                tuple(current_points[i + 1]),
                color,
                3
            )

        if len(current_points) > 1:
            cv2.line(
                frame,
                tuple(current_points[-1]),
                tuple(current_points[0]),
                color,
                1
            )

        instruction = f"Teken zone: {current_zone} | Klik punten | ENTER = opslaan | BACKSPACE = laatste punt"
    else:
        instruction = "Alle zones opgeslagen. Druk Q om af te sluiten."

    cv2.putText(
        frame,
        instruction,
        (40, 60),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 255),
        3
    )

    cv2.imshow(WINDOW_NAME, frame)

    key = cv2.waitKey(1) & 0xFF

    # ENTER = huidige zone opslaan
    if key == 13:
        if current_zone_index < len(zone_names):
            if len(current_points) >= 3:
                zone_name = zone_names[current_zone_index]

                zones[zone_name] = {
                    "points": current_points.copy()
                }

                print(f"{zone_name} opgeslagen:", current_points)

                current_points = []
                current_zone_index += 1

                if current_zone_index >= len(zone_names):
                    save_zones()
            else:
                print("Minstens 3 punten nodig voor een polygon.")

    # BACKSPACE = laatste punt verwijderen
    elif key == 8:
        if current_points:
            removed = current_points.pop()
            print("Punt verwijderd:", removed)

    # S = manueel opslaan
    elif key == ord("s"):
        save_zones()

    # Q = afsluiten
    elif key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()