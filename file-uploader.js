//IE support to array.indexOf
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(obj, start) {
    for (var i = (start || 0), j = this.length; i < j; i++) {
      if (this[i] === obj) { return i; }
    }
    return -1;
  }
}
var file_uploader = {
  uploadWrapId: '',
  maxFiles: '',
  maxFileSize: null,
  fileCounter: 1,
  filesAdded: [],
  existingFiles: [],
  existingFilesInputName: '',
  showsize:0,

  detectInternetExplorer : function() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){ // If Internet Explorer
      return true;
    }
    return false;
  },

  init : function() {
    if(this.detectInternetExplorer()){
      jQuery(file_uploader.uploadWrapId).find('.uploaded_files').removeClass('hidden');
    }
    jQuery(file_uploader.uploadWrapId).on('click', ".add_file",  function(e){
      e.preventDefault();
      file_uploader.addFile();
    });
    jQuery(file_uploader.uploadWrapId).on('click', '.upload_input', function(e) {
      var inputValue = jQuery(this).val();
      if(inputValue != '' ) {       
        e.preventDefault();
        jQuery(file_uploader.uploadWrapId).find('.upload_message').html('Action not Allowed!').removeClass('hidden');
        setTimeout(function() {
          jQuery(file_uploader.uploadWrapId).find('.upload_message').addClass('hidden');
        }, 8000);
      }
    })
    jQuery(file_uploader.uploadWrapId).on("change", ".upload_input", function(e){  
      e.preventDefault();
      jQuery(this).addClass('throw-out');
      file_uploader.checkUpload(this);
    });
    jQuery(file_uploader.uploadWrapId).on("click", ".remove_file", function(e){  
      e.preventDefault();
      file_uploader.deleteElementValue(jQuery(this).parents('.file_label').index());
      file_uploader.deleteUpload(jQuery(this).parent('.file_label'), jQuery(this).parents('.file_label').index());
    });
    file_uploader.handleExistingFiles();
  },

  addFile : function(objEvent) {
    jQuery(file_uploader.uploadWrapId).find('.upload_message').addClass('hidden');
    if(file_uploader.maxFiles != '' && file_uploader.fileCounter > file_uploader.maxFiles) {
      jQuery(file_uploader.uploadWrapId).find('.upload_message').html('Not more than ' + file_uploader.maxFiles + ' files!').removeClass('hidden');
      setTimeout(function() {
        jQuery(file_uploader.uploadWrapId).find('.upload_message').addClass('hidden');
      }, 8000);
      return;
    }
    if (file_uploader.fileCounter <= file_uploader.maxFiles && jQuery(file_uploader.uploadWrapId).find('.uploaded_files input:last-child').not('.hidden').val() != '')
      file_uploader.addInputElement();
    if(!file_uploader.detectInternetExplorer())
      jQuery(file_uploader.uploadWrapId).find('.uploaded_files input:last-child').trigger('click');   
  },
  
  addInputElement : function(fileValue) {
    if(file_uploader.fileCounter > file_uploader.maxFiles)
      return;
    var elementTemplate = jQuery(file_uploader.uploadWrapId).find('.element_template');
    var newElement = elementTemplate.clone();
    var newElementHtml = newElement.html(); 
    newElementHtml = newElementHtml.replace( new RegExp ('::FileName::' , 'i'), (file_uploader.maxFiles == 1 ? (file_uploader.uploadWrapId).substr(1) : (file_uploader.uploadWrapId).substr(1) + '[]'));
    jQuery(file_uploader.uploadWrapId).find('.uploaded_files').append(newElementHtml);
  },
  
  addFileLabel : function(size, name, showsize) {
    var fileLabelTemplate = jQuery(file_uploader.uploadWrapId).find('.file_label_template .file_label');
    var newLabel = fileLabelTemplate.clone();
    var newLabelHtml = newLabel.html();
    if(size < 0.1)
       {
          newLabelHtml = newLabelHtml.replace( new RegExp( "::FileName::", "i" ), (name + ' ' + '(' + showsize + ' KB)'));
       }
    else{
    newLabelHtml = newLabelHtml.replace( new RegExp( "::FileName::", "i" ), (name + ' ' + '(' + size + ' MB)'));
    }
    newLabel.html(newLabelHtml);
    jQuery(file_uploader.uploadWrapId).find('.uploaded_file_list').append(newLabel);
    file_uploader.filesAdded.push(name);
    if(file_uploader.fileCounter == file_uploader.maxFiles) 
      jQuery('.add_file').hide();
    file_uploader.fileCounter++; 
  },
  
  checkUpload : function(el) {
    var fileFakePath = el.value;
    if(window.File) {
      var size = ((el.files[0].size)/(1024*1024)).toFixed(1);
      if(size < 0.1)
          {
    	  file_uploader.showsize =	((el.files[0].size)/(1024)).toFixed(1); 
          }
      var name =  jQuery(el).val().split('\\').pop();
    }
    else {
      try{
        var fileSo = new ActiveXObject('Scripting.FileSystemObject');
      }
      catch(e){
        jQuery(file_uploader.uploadWrapId)
        .find('.upload_message')
        .html('Kindly Enable ActiveX from Tools -> Internet Options -> Security -> \nCustom Level -> Reset custom settings to Medium -> Click Reset.\n In Settings scroll down to Active X Controls and plugins -> Select Prompt for\n Download unsigned ActiveX Controls and \n Initialize and script ActiveX Controls.\nNow refresh the page to continue.')
        .removeClass('hidden');
        jQuery(file_uploader.uploadWrapId).find('.uploaded_files').addClass('hidden');
        jQuery(file_uploader.uploadWrapId).find('.add_file').attr('disabled','disabled');
        return;
      }
      var size = ((fileSo.getFile(fileFakePath).size)/(1024*1024)).toFixed(1);
      if(size < 0.1)
      {
    	  file_uploader.showsize =	((el.files[0].size)/(1024)).toFixed(1); 
      }
      var name = fileSo.getFile(fileFakePath).name;
    }
    if(file_uploader.filesAdded.indexOf(name) != -1) {
      jQuery(file_uploader.uploadWrapId).find('.upload_message').html('File already exists!').removeClass('hidden');
      setTimeout(function() {
        jQuery(file_uploader.uploadWrapId).find('.upload_message').addClass('hidden');
      }, 8000); 
      file_uploader.deleteElementValue(el);
      return;
    }
    if(file_uploader.maxFileSize != null && size > file_uploader.maxFileSize) {
      jQuery(file_uploader.uploadWrapId).find('.upload_message').html('Size of the file can\'t be more than ' + file_uploader.maxFileSize + 'MB!').removeClass('hidden');
      setTimeout(function() {
        jQuery(file_uploader.uploadWrapId).find('.upload_message').addClass('hidden');
      }, 8000);
      file_uploader.deleteElementValue(el);
      return;
    } 
    file_uploader.addFileLabel(size, name, file_uploader.showsize);
  },

  deleteUpload : function(el, index) {
    index = index + 1;
    el.remove();
    file_uploader.fileCounter--;
    jQuery('.add_file').show();
    file_uploader.filesAdded.splice(index-1, 1);
  },

  deleteElementValue : function(elIndex) {
    elIndex = elIndex + 1;
    if (elIndex > 0) {
      jQuery(file_uploader.uploadWrapId).find('.uploaded_files input:nth-child(' + elIndex +')').remove(); 
    }
    else {
      jQuery(file_uploader.uploadWrapId).find('.uploaded_files input:last-child').remove(); 
    }
  },

  addExistingFileLabel : function(fileDetails) {
    var existingFileLabelTemplate = jQuery(file_uploader.uploadWrapId).find('.existing_file_label_template .file_label');
    var newExistingFileLabel = existingFileLabelTemplate.clone();
    newExistingFileLabel.find('input').attr('value', (fileDetails.file_id));
    var newExistingFileLabelHtml = newExistingFileLabel.html();
    newExistingFileLabelHtml = newExistingFileLabelHtml.replace( new RegExp( "::FileName::", "i" ), (fileDetails.name));
    newExistingFileLabelHtml = newExistingFileLabelHtml.replace( new RegExp( "::FileType::", "i" ), (file_uploader.maxFiles == 1 ? (file_uploader.existingFilesInputName) : (file_uploader.existingFilesInputName) + '[]'));
    newExistingFileLabel.html(newExistingFileLabelHtml);
    jQuery(file_uploader.uploadWrapId).find('.uploaded_file_list').append(newExistingFileLabel);
    if(file_uploader.fileCounter == file_uploader.maxFiles) 
      jQuery('.add_file').hide();
    file_uploader.fileCounter++;
  },

  handleExistingFiles : function() {
    if(file_uploader.existingFiles && file_uploader.existingFiles.length > 0) {
      if(file_uploader.existingFiles.length == file_uploader.maxFiles) {
        jQuery(file_uploader.uploadWrapId).find('.uploaded_files input').remove();
      }
      for (var i in file_uploader.existingFiles) {
        var file = file_uploader.existingFiles[i];
        if(file.name != '' && file.name != undefined) {
          file_uploader.addExistingFileLabel(file);
          file_uploader.filesAdded.push(file.name);
        }
      }
    }
  }
}
