# Local Projects Interview
![forthebadge](https://forthebadge.com/images/badges/made-with-vue.svg)
![forthebadge](https://forthebadge.com/images/badges/made-with-crayons.svg)

Requirements:

- Prompt users with a question
- Provide yes, no response with a drag and drop interaction
- After the user's response is taken an image is captured using the webcam and passed through a shader and displayed to the user for ~5 seconds. 
- The image is then resized using a webworker and saved to the back-end.
- Based off participant's response a set of ongoing tokens / metrics update.
- Next question is presented to the user.

```
# install dependencies
yarn install

# run a development server including watching your javascript and less files
yarn watch

# build / bundle files for deployment
yarn build
