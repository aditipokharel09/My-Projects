import cv2
import csv
import os
import urllib.request
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

MODEL_FILE = "hand_landmarker.task"
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
CSV_FILE = "gesture_landmarks.csv"

GESTURES = {
    "1": "fist",
    "2": "open_palm",
    "3": "thumbs_up",
    "4": "peace",
    "5": "pointing",
}

SAMPLES_PER_GESTURE = 100


def download_model():
    if not os.path.exists(MODEL_FILE):
        print("Downloading MediaPipe hand model...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_FILE)
        print("Model downloaded.")


def create_landmarker():
    options = vision.HandLandmarkerOptions(
        base_options=python.BaseOptions(
            model_asset_path=MODEL_FILE
        ),
        running_mode=vision.RunningMode.IMAGE,
        num_hands=1,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    return vision.HandLandmarker.create_from_options(options)


def main():
    download_model()

    file_exists = os.path.exists(CSV_FILE)

    with open(CSV_FILE, "a", newline="") as f:
        writer = csv.writer(f)

        if not file_exists:
            header = ["label"]

            for i in range(21):
                header.extend([f"x{i}", f"y{i}"])

            writer.writerow(header)

        cap = cv2.VideoCapture(0)

        if not cap.isOpened():
            print("ERROR: Could not open webcam.")
            return

        landmarker = create_landmarker()

        print()
        print("=" * 55)
        print("REAL HAND GESTURE DATA COLLECTION")
        print("=" * 55)
        print()
        print("1 = fist")
        print("2 = open_palm")
        print("3 = thumbs_up")
        print("4 = peace")
        print("5 = pointing")
        print()
        print("SPACE = capture sample")
        print("Q = quit")
        print()
        print("Target: 100 samples per gesture")
        print()

        current_gesture = None
        counts = {name: 0 for name in GESTURES.values()}

        while True:
            ret, frame = cap.read()

            if not ret:
                print("Could not read webcam frame.")
                break

            frame = cv2.flip(frame, 1)

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=rgb
            )

            result = landmarker.detect(mp_image)

            if result.hand_landmarks:
                landmarks = result.hand_landmarks[0]

                h, w, _ = frame.shape

                for landmark in landmarks:
                    x = int(landmark.x * w)
                    y = int(landmark.y * h)

                    cv2.circle(
                        frame,
                        (x, y),
                        4,
                        (0, 255, 0),
                        -1
                    )

                for connection in vision.HandLandmarksConnections.HAND_CONNECTIONS:
                    start = landmarks[connection.start]
                    end = landmarks[connection.end]

                    x1 = int(start.x * w)
                    y1 = int(start.y * h)
                    x2 = int(end.x * w)
                    y2 = int(end.y * h)

                    cv2.line(
                        frame,
                        (x1, y1),
                        (x2, y2),
                        (255, 0, 0),
                        2
                    )

            if current_gesture:
                text = (
                    f"{current_gesture}: "
                    f"{counts[current_gesture]}/{SAMPLES_PER_GESTURE}"
                )
            else:
                text = "Press 1-5 to select gesture"

            cv2.putText(
                frame,
                text,
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )

            cv2.putText(
                frame,
                "SPACE = capture | Q = quit",
                (20, 75),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2
            )

            cv2.imshow("Gesture Data Collection", frame)

            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                break

            if key in [ord("1"), ord("2"), ord("3"), ord("4"), ord("5")]:
                current_gesture = GESTURES[chr(key)]
                print(f"Selected: {current_gesture}")

            if key == 32:
                if current_gesture is None:
                    print("Select a gesture first.")
                    continue

                if not result.hand_landmarks:
                    print("No hand detected. Try again.")
                    continue

                landmarks = result.hand_landmarks[0]

                row = [current_gesture]

                for landmark in landmarks:
                    row.extend([landmark.x, landmark.y])

                writer.writerow(row)
                f.flush()

                counts[current_gesture] += 1

                print(
                    f"{current_gesture}: "
                    f"{counts[current_gesture]}/{SAMPLES_PER_GESTURE}"
                )

        landmarker.close()
        cap.release()
        cv2.destroyAllWindows()

        print()
        print("DATA COLLECTION FINISHED")
        print()
        print(f"Saved to: {CSV_FILE}")

        for gesture, count in counts.items():
            print(f"  {gesture}: {count}")


if __name__ == "__main__":
    main()