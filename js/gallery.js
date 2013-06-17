(function() {
    
    var galleryContainer = document.getElementById('galleryContainer');
    var galleryDetails = document.getElementById('galleryDetails');

    galleryContainer.addEventListener('click', function(ev) {
        var target = ev.target;
        if(target && target.nodeName === 'IMG') {
            showDetails(target.dataset['id']);
        }
    }, false);
    
    Picture.getAll(function(pictures) {

        galleryContainer.innerHTML = '';

        pictures.forEach(function(pic) {
            var img = document.createElement('img');
            img.src = pic.imageData;
            img.dataset['id'] = pic.id;
            galleryContainer.appendChild(img);
        });
    });

    function showDetails(pictureId) {

        galleryDetails.innerHTML = 'Loading...';

        Picture.getById(pictureId, function(picture) {
            var img = document.createElement('img');
            img.src = picture.imageData;

            var actions = [
                { text: 'Download...', action: downloadPicture }
            ];

            var actionsDiv = document.createElement('div');
            
            actions.forEach(function(action) {
                var input = document.createElement('input');
                input.value = action.text;
                input.type = 'button';
                input.addEventListener('click', function(ev) {
                    action.action(pictureId, picture);
                }, false);
                actionsDiv.appendChild(input);
            });

            galleryDetails.innerHTML = '';
            galleryDetails.appendChild(img);
            galleryDetails.appendChild(actionsDiv);
        });

    }

    function downloadPicture(pictureId, picture) {
        
        var a = document.createElement('a');
        a.setAttribute('href', picture.imageData);
        a.setAttribute('download', pictureId + picture.getExtension());
        
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

    }

})();