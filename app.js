function renderRepo({title, description, link, author}) {
    return `
     <div class="repo">     
        <div class="repo__row">
            <a class="repo__title"
               href="${link}" 
               target="_blank">
                ${title}
            </a>
        </div>
        <div class="repo__description">
            ${description || '(Без описания)'}
        </div>
        <div class="repo__row">
            <a class="repo__author" href="${author.link}" target="_blank">
                <img class="repo__avatar"
                     src="${author.avatar}"
                     alt="${author.name}">
                <div class="repo__author-name">${author.name}</div>
            </a>
        </div>
    </div>
 `
}

function getRepos(searchString) {
    return fetch(`https://api.github.com/search/repositories?per_page=10&q=${searchString}`)
        .then((response) => response.json())
        .then((data) => {
            return data.items.map((item) => {
                return {
                    title: item.name,
                    description: item.description,
                    link: item.html_url,
                    author: {
                        name: item.owner?.login,
                        avatar: item.owner?.avatar_url,
                        link: item.owner?.html_url
                    }
                }
            })
        })
}

function refreshData(reposElement, searchString) {
    getRepos(searchString).then((repos) => {
        reposElement.innerHTML = repos.length
            ? repos.map(renderRepo).join('')
            : `<span class="repos__empty">Ничего не найдено</span>`
    }).catch(() => {
        reposElement.innerHTML = `<span class="repos__empty">Ошибка</span>`
    })
}

function reset(reposElement) {
    reposElement.innerHTML = `<span class="repos__empty">Поиск по репозиториям GitHub</span>`
}

function throttle(func, ms, immediately) {
    let isThrottled = false
    let savedArgs
    let savedThis
    let currentImmediately = immediately

    function wrapper() {
        if (isThrottled) {
            savedArgs = arguments
            savedThis = this
            return
        }

        if (currentImmediately) {
            func.apply(this, arguments)
            currentImmediately = false
        }
        isThrottled = true

        setTimeout(function () {
            isThrottled = false
            if (savedArgs) {
                currentImmediately = true
                wrapper.apply(savedThis, savedArgs)
                savedArgs = savedThis = null
            }
        }, ms)
    }

    return wrapper
}

window.onload = () => {
    const formElement = document.querySelector('.form')
    const searchElement = document.querySelector('.form__search')
    const reposElement = document.querySelector('.repos')

    const refreshDataThrottled = throttle(refreshData, 1000)

    formElement.addEventListener('submit', (e) => {
        e.preventDefault()
        refreshDataThrottled(reposElement, searchElement.value, true)
    })

    searchElement.addEventListener('input', (e) => {
        const value = searchElement.value
        if (formElement.reportValidity()) {
            refreshDataThrottled(reposElement, value)
        } else if (!value) {
            reset(reposElement)
        }
    })

    searchElement.focus()
}
