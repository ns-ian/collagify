$(() => {
  $('#collageParams').submit(e => {
    const ALBUM_IDS_IDX = 2;
    paramData = $('#collageParams').serializeArray();
    console.log(paramData);

    $.ajax({
      type: 'POST',
      url: '/',
      cache: false,
      data: { albumIdStr: paramData[ALBUM_IDS_IDX]['value'] },
      success: generateOutcome,
      error: generateError
    });
    e.preventDefault();
  });
});

function generateOutcome(data, textStatus, jqXHR) {
  const COLLAGE_TITLE_IDX = 0;
  const NUM_COLS_IDX = 1;

  if ($('#collagify-div').length) {
    $('#collagify-div').remove();
  }

  createTable(paramData[COLLAGE_TITLE_IDX]['value']);
  createCollage(paramData[NUM_COLS_IDX]['value']);
  populateTable(data, paramData[NUM_COLS_IDX]['value']);
}

function generateError(jqXHR, textStatus, errorThrown) {
  appendErrorMsg(jqXHR.status);
}

function appendErrorMsg(status) {
  var $errorMsg = undefined;
  switch(status) {
    case 400:
      $errorMsg = $('<p>Your request is malformed. Check the format of your input, and then try again.</p>');
      break;
    case 500:
      $errorMsg = $('<p>Oops! An error has occurred. Please try again, or come back later.</p>');
      break;
    default:
      $errorMsg = $('<p>An unspecified error has occurred.</p>');
  }

  if ($('#collagify-div').length) {
    $('#collagify-div').html($errorMsg);
  } else {
    let html = $('<div id="collagify-div">').append($errorMsg);
    html.appendTo('body');
  }
}

function createTable(title) {
  $('<div id="collagify-div">').appendTo('body');
  appendSaveButton();
  var $table = $('<table id="collagify">');
  $table.append(`<tr><td colspan="2">${title}</td></tr>`);
  $table.append('<tr><td id="collageCell"><td id="legendCell">');
  $table.appendTo('#collagify-div');
}

function createCollage(columns) {
  var $collage = $('<table id="collage">');
  $collage.append('<tr id="headerRow"><td />');
  $collage.appendTo('#collageCell');

  $headerRow = $('#headerRow');
  for(let i = 0; i < columns; i++) {
    $headerRow.append(`<td style="text-align:center">${i + 1}</td>`);
  }
}

function populateTable(albums, columns) {
  var rowsTotal = albums.length / columns;
  var $collage = $('#collage');
  var $legend = $('#legendCell');

  // decimal range of UTF code points (A-Z)
  if (65 + rowsTotal > 90) { // Don't validate length, just throw it out
    rowsTotal = 25;
  }

  for(let i = 65; i < 65 + rowsTotal; i++) {
    let $row = $('<tr>');
    let rowChar = String.fromCharCode(i);
    $row.append(`<td>${rowChar}</td>`);

    for (let j = 0; j < columns; j++) {
      let album = albums.pop();
      console.log(album);
      if (album != undefined) {
        if (j === 0) {
          $legend.append(`<tr><td><ul id=${rowChar}>`);
        }
        $row.append(`<td><img src=${album.images[1].url}>`);
        $row.appendTo($collage);
        $(`#${rowChar}`).append(`<li>${rowChar + (j + 1) + ': ' + parseArtists(album.artists) + ' - ' + album.name}</li>`);
      }
    }
  }
}

function parseArtists(artists) {
  if (artists.length === 1) {
    return artists[0]['name'];
  } else {
    var lastIdx = artists.length - 1;
    var artistStr = '';
    for(let i = 0; i < artists.length; i++) {
      let name = artists[i]['name'];
      if (i === 0) {
        artistStr += name;
      } else if (i === lastIdx) {
        if (i === 1) {
          artistStr += ` & ${name}`;
        } else {
          artistStr += `, and ${name}`;
        }
      } else {
        artistStr += `, ${name}`;
      }
    }
    return artistStr;
  }
}

function appendSaveButton() {
  var $saveButton = $('<button>Export to PNG</button>');
  var $successMessage = $('<p><span id="successMsg">Your generated collage is available below. You can save it by clicking this button: </span></p>');
  $saveButton.prop('id', 'saveButton');
  $saveButton.prop('class', 'button');
  $successMessage.appendTo('#collagify-div');
  $saveButton.insertAfter('#successMsg');
  $saveButton.click(generateCanvas);
}

function generateCanvas() {
  window.scrollTo(0,0); // Prevent canvas from being cut off
  html2canvas(document.querySelector('#collagify'), { useCORS: true, backgroundColor: '#000000' })
    .then(canvas => {
      canvas.toBlob(blob => {
        saveAs(blob, 'test.png');
      });
    });
}

function saveAs(blob, filename) {
  var a = document.createElement('a');
  document.body.appendChild(a);
  a.style.cssText = 'display:none';

  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
  a.parentNode.removeChild(a);
}
