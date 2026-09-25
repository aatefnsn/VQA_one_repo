# VQA Front End hosted on Google Cloud to test the VQA model
![alt-text](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWFuMHVjcmt6cjFrcHNiY3loNDNoMTI4b3hzaWVxcWZ2emt0cmpqeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/aV5L9DOi1ArdQ8tF6k/giphy.gif))

# VQA_FrontEnfd_ReactJS


# Visual Question Answering Front End Project

## Overview

This project is a front-end application designed to test a Visual Question Answering (VQA) model that I trained. The model is containerized and hosted on Google Cloud Platform. The front end is built using the React JavaScript framework and is specifically designed to be an accessible web application to assist visually impaired users.

## Features

### Accessibility
- **Voice Input**: Users can ask questions using the microphone on their device. This feature leverages the Deep Speech API to convert spoken questions into written text.
- **Image Selection**: Users can either select an image from their device or use the camera to stream a live image.
- **Accessible Interface**: The application is designed with accessibility in mind, ensuring that visually impaired users can easily navigate and use the application.

### Workflow
1. **Voice Input**: The user speaks a question into the microphone.
2. **Speech to Text**: The Deep Speech API converts the spoken question into written text.
3. **Image Selection**: The user selects an image or streams a live image using the camera.
4. **Send Request**: The user presses the send button, which sends an HTTPS GET request to the VQA model.
5. **Model Processing**: The model processes the image and the question to generate an answer.
6. **Display Answer**: The answer is sent back in the HTTPS response and is displayed on the screen for the user.

## Technical Details

### Front End
- **Framework**: React JavaScript
- **Accessibility**: Designed to be fully accessible for visually impaired users
- **Speech Recognition**: Utilizes the Deep Speech API for converting spoken questions into text

### Back End
- **Model Hosting**: The VQA model is containerized and hosted on Google Cloud Platform
- **API Communication**: The front end communicates with the model via HTTPS GET requests

## How It Works

1. **User Interaction**: The user interacts with the application by speaking a question and selecting an image.
2. **Speech to Text Conversion**: The Deep Speech API converts the spoken question into text.
3. **Image and Question Submission**: The user submits the image and the question by pressing the send button.
4. **Model Processing**: The VQA model receives the image and the question, processes them, and generates an answer.
5. **Answer Display**: The answer is sent back to the front end and displayed on the screen for the user.

## Conclusion

This project demonstrates the integration of a VQA model with an accessible front-end application. By leveraging the Deep Speech API and hosting the model on Google Cloud Platform, the application provides a seamless and accessible experience for visually impaired users to interact with visual content through spoken questions.


