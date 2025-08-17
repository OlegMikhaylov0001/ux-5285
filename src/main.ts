document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('clear') === 'true') {
    localStorage.removeItem('authToken')
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  const savedToken = localStorage.getItem('authToken')

  if (
    savedToken &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    window.location.href = `https://www.dating.com/people/#token=${savedToken}`
    return
  }

  if (
    savedToken &&
    (window.location.hostname.includes('localhost') ||
      window.location.hostname.includes('127.0.0.1'))
  ) {
    console.log('Saved token found (localhost mode):', savedToken)
  }

  const buttonForm = document.querySelector('.buttonForm') as HTMLButtonElement
  const popupOverlay = document.querySelector('.popup-overlay') as HTMLElement
  const closeBtn = document.querySelector('.popup-close') as HTMLButtonElement
  const form = document.querySelector('.popup-form') as HTMLFormElement

  if (buttonForm && popupOverlay) {
    buttonForm.addEventListener('click', () => {
      popupOverlay.style.display = 'flex'
    })
  }

  if (closeBtn && popupOverlay) {
    closeBtn.addEventListener('click', () => {
      closePopup()
    })

    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        closePopup()
      }
    })
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupOverlay.style.display === 'flex') {
      closePopup()
    }
  })

  if (form) {
    form.addEventListener('submit', handleFormSubmit)
  }

  function closePopup() {
    popupOverlay.style.display = 'none'
  }

  async function handleFormSubmit(e: Event) {
    e.preventDefault()

    const emailInput = form.querySelector('#email') as HTMLInputElement
    const passwordInput = form.querySelector('#password') as HTMLInputElement

    const email = emailInput.value.trim()
    const password = passwordInput.value.trim()

    if (!validateForm(email, password)) {
      return
    }

    try {
      const authResponse = await fetch('https://api.dating.com/identity', {
        method: 'GET',
        headers: {
          Authorization: `Basic ${btoa(`${email}:${password}`)}`,
        },
      })

      if (authResponse.ok) {
        const token = authResponse.headers.get('X-Token')
        console.log('Authorization successful, token:', token)

        if (token) {
          localStorage.setItem('authToken', token)
          window.location.href = `https://www.dating.com/people/#token=${token}`
          return
        }
      }
    } catch (error) {
      console.log('Authorization failed, trying registration:', error)
    }

    try {
      const response = await fetch('https://api.dating.com/identity', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const token = response.headers.get('X-Token')
        console.log('Registration successful, token:', token)

        if (token) {
          localStorage.setItem('authToken', token)
        }

        showSuccessMessage()
      } else {
        const errorText = await response.text()
        console.error('Registration failed:', response.status, errorText)

        if (response.status === 400) {
          showError('User already exists or invalid data. Please check your credentials.')
        } else {
          showError(`Registration failed: ${response.status} - ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error('Network error:', error)
      showError('Network error. Please check your connection and try again.')
    }
  }

  function validateForm(email: string, password: string): boolean {
    clearErrors()
    let isValid = true

    if (!isValidEmail(email)) {
      showFieldError('email', 'Please enter a valid email address')
      isValid = false
    }

    if (password.length < 8) {
      showFieldError('password', 'Password must be at least 8 characters long')
      isValid = false
    }

    return isValid
  }

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  function showFieldError(fieldName: string, message: string) {
    const field = document.getElementById(fieldName)
    if (field) {
      let errorElement = field.parentElement?.querySelector('.error-message')
      if (!errorElement) {
        errorElement = document.createElement('div')
        errorElement.className = 'error-message'
        field.parentElement?.appendChild(errorElement)
      }
      errorElement.textContent = message
    }
  }

  function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message')
    errorMessages.forEach((msg) => msg.remove())
  }

  function showError(message: string) {
    alert(message)
  }

  function showSuccessMessage() {
    const popupContent = document.querySelector('.popup-content')
    if (popupContent) {
      popupContent.innerHTML = `
          <button class="popup-close">
            <img src="/assets/crossClosed.svg" alt="close button" />
          </button>
          <div class="success-message">
            <h2>Thank You!</h2>
            <p>To complete registration, please check your e-mail</p>
          </div>
        `

      const newCloseBtn = popupContent.querySelector('.popup-close') as HTMLButtonElement
      if (newCloseBtn) {
        newCloseBtn.addEventListener('click', closePopup)
      }
    }
  }
})
