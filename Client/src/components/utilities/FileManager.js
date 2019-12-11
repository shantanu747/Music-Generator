import React from 'react';
/*$("#addBTN").click(function(event)
{
   var fileInput = document.getElementById('file-input');
   var fileList = fileInput.files;
   alert(fileList[0].value);

   for(var i = 0; i < fileList.length; i++)
   {
      if(checkExtension(fileList[i]) && checkDuplicate(file))
      {
         // assert not duplicate and right file type before saving user uploaded file to the folder
         sendFile(file);
         updateInputFileDiv();
      }
   }
//This function was commented out
   function sendFile(file)
   {
      var formData = new FormData();
      var request = new XMLHttpRequest();

      formData.set('file', file);
      request.open("POST", "../../User\ Uploads");
      request.send(formData);
   }
});*/

function checkDuplicate(file)
{
   // checks user input folder, returns true if file being added DNE in the folder
   // returns false is file is already in folder --> won't get uploaded twice

   //stub code, will be implemented later
   return true;

}

function checkExtension(props)
{
   // checks the extension of the file being uploaded
   // returns true if valid file type, returns false otherwise

   var validFileExtensions = [".wav", ".midi", ".mid", ".mp3"];
   var isValid = false;
   if(props.file.type == "file")
   {
      var fileName = props.file.value;
      if(fileName.length > 0)
      {
         for(var i = 0; i < validFileExtensions.length; i++)
         {
            if(fileName.substr(fileName.length - validFileExtensions[i].length, validFileExtensions[i].length).toLowerCase() == validFileExtensions[i].toLowerCase()) //this line is straight from StackOverflow, needs testing
            {
               isValid = true;
               break;
            }
         }
      }
      if(!isValid)
      {
         alert("Sorry, "+fileName+" is not a supported file type! Valid file types are .wav, .midi, .mid, and .mp3");
         props.file.value = ""; //nullify the
         return false;
      }
      return isValid;
   }
}
export default checkExtension();
function updateInputFileDiv()
{
   // reads files in User Uploads, for each file in that folder it creates
   // a new p tag with the file name in it and add it to the user inputs column
}

