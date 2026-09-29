import argparse
import contextlib
import json
import sys

import cv2
from ultralytics import YOLO


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', required=True)
    parser.add_argument('--image', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--confidence', type=float, default=0.25)
    parser.add_argument('--device', default='')
    args = parser.parse_args()

    with contextlib.redirect_stdout(sys.stderr):
        model = YOLO(args.model)
        prediction_options = {
            'source': args.image,
            'conf': args.confidence,
            'verbose': False,
        }
        if args.device:
            prediction_options['device'] = args.device
        result = model.predict(**prediction_options)[0]

    detections = []
    if result.boxes is not None:
        for box in result.boxes:
            class_id = int(box.cls[0].item())
            x1, y1, x2, y2 = [float(value) for value in box.xyxy[0].tolist()]
            detections.append({
                'className': str(model.names[class_id]),
                'confidence': float(box.conf[0].item()),
                'bbox': {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2},
            })
    detections.sort(key=lambda detection: detection['confidence'], reverse=True)

    if not cv2.imwrite(args.output, result.plot()):
        raise RuntimeError('Could not save the annotated prediction image.')

    print(json.dumps({
        'detections': detections[:10],
        'imageWidth': int(result.orig_shape[1]),
        'imageHeight': int(result.orig_shape[0]),
    }))


if __name__ == '__main__':
    main()