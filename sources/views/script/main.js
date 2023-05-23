function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

var previewContainers = document.querySelectorAll('.preview-container');

function checkPreviewContainers() {
  previewContainers.forEach(function(container) {
    if (isElementInViewport(container)) {
      container.classList.add('show');
    }
  });
}

window.addEventListener('scroll', checkPreviewContainers);

document.querySelector('.submit-button').addEventListener('click', function() {
  fetch('/auth/sign-mail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mail: document.querySelector('.mail-zone').value
      })
    })
    .then(function(res) {
      return res.json();
    }
  )
  .then(function(data) {
    document.querySelector('.submit-button').classList.remove('button--loading')
    if (data.error) {
      alert('Une erreur est survenue');
    } else {
      alert(data.message)
    }
  });
});
