import os
import urllib.request
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

MODEL_FILE='hand_landmarker.task'
WEIGHTS_FILE='outputs/mlp_weights.npz'
MODEL_URL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

if not os.path.exists(WEIGHTS_FILE):
    raise FileNotFoundError('outputs/mlp_weights.npz was not found. Run: python mlp_gesture_classifier.py')

weights=np.load(WEIGHTS_FILE,allow_pickle=True)
W1,b1,W2,b2=weights['W1'],weights['b1'],weights['W2'],weights['b2']
X_mean,X_std=weights['X_mean'],weights['X_std']
CLASSES=[str(x) for x in weights['classes']]
X_std=np.where(X_std==0,1.0,X_std)

def sigmoid(z):
    return 1.0/(1.0+np.exp(-np.clip(z,-500,500)))

def softmax(z):
    z=z-np.max(z)
    e=np.exp(z)
    return e/e.sum()

def predict_gesture(v):
    x=(v-X_mean)/X_std
    a1=sigmoid(x@W1+b1)
    a2=softmax(a1@W2+b2)
    i=int(np.argmax(a2))
    return CLASSES[i],float(a2[i]),a2

if not os.path.exists(MODEL_FILE):
    print('Downloading MediaPipe hand model...')
    urllib.request.urlretrieve(MODEL_URL,MODEL_FILE)
    print('Download complete.')

options=vision.HandLandmarkerOptions(
    base_options=python.BaseOptions(model_asset_path=MODEL_FILE),
    running_mode=vision.RunningMode.IMAGE,
    num_hands=1,
    min_hand_detection_confidence=0.5,
    min_hand_presence_confidence=0.5,
    min_tracking_confidence=0.5,
)
landmarker=vision.HandLandmarker.create_from_options(options)

CONNECTIONS=[(0,1),(1,2),(2,3),(3,4),(0,5),(5,6),(6,7),(7,8),(0,9),(9,10),(10,11),(11,12),(0,13),(13,14),(14,15),(15,16),(0,17),(17,18),(18,19),(19,20),(5,9),(9,13),(13,17)]

print('Starting webcam... Press Q to quit.')
cap=cv2.VideoCapture(0)
if not cap.isOpened():
    raise RuntimeError('Could not open webcam. Close other camera applications and try again.')

while True:
    ok,frame=cap.read()
    if not ok: break
    frame=cv2.flip(frame,1)
    h,w=frame.shape[:2]
    rgb=cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
    result=landmarker.detect(mp.Image(image_format=mp.ImageFormat.SRGB,data=rgb))
    gesture='No hand'; confidence=0.0; probs=None
    if result.hand_landmarks:
        hand=result.hand_landmarks[0]
        coords=np.asarray([v for lm in hand for v in (lm.x,lm.y)],dtype=np.float64)
        gesture,confidence,probs=predict_gesture(coords)
        pts=[]
        for lm in hand:
            p=(int(lm.x*w),int(lm.y*h)); pts.append(p); cv2.circle(frame,p,5,(255,255,255),-1)
        for a,b in CONNECTIONS: cv2.line(frame,pts[a],pts[b],(255,255,255),2)
    cv2.rectangle(frame,(10,10),(530,125),(0,0,0),-1)
    cv2.putText(frame,f'Gesture: {gesture}',(25,50),cv2.FONT_HERSHEY_SIMPLEX,.85,(255,255,255),2)
    cv2.putText(frame,f'Confidence: {confidence*100:.1f}%',(25,85),cv2.FONT_HERSHEY_SIMPLEX,.7,(255,255,255),2)
    cv2.putText(frame,'Press Q to quit',(25,112),cv2.FONT_HERSHEY_SIMPLEX,.55,(255,255,255),1)
    if probs is not None:
        y=160
        for name,p in zip(CLASSES,probs):
            cv2.putText(frame,f'{name}: {p*100:.1f}%',(25,y),cv2.FONT_HERSHEY_SIMPLEX,.55,(255,255,255),1); y+=25
    cv2.imshow('Neural Network - Real-Time Gesture Recognition',frame)
    if cv2.waitKey(1)&0xFF==ord('q'): break
cap.release(); cv2.destroyAllWindows()
print('Webcam demo closed.')
