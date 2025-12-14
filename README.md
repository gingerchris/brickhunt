This is a Typescript/React/Vite project to help you find missing lego bricks in your collection.

To create a brick list you can: 
 - use your camera to scan the QR code on the back of any lego set box. The app will generate a list of all the bricks in that set, and you can select which are missing.
 - Manually enter the Lego ID of parts
 - use your camera to take a picture the brick from the instruction manual - the app will use OCR to identify the part number.  Your photo may include multiple IDs so the app will allow you to select the correct one from a list.

This app uses the Rebrickable API to retrieve lists of bricks and brick images and details.

You can check off bricks as you find them, and create multiple brick lists for different sets. The app will keep track of which bricks you have found and which ones you still need to find.  All data is stored locally in your browser's local storage, so you don't need to create an account or sign in to use the app.