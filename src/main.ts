import { createInterface } from 'readline'
import fetch, { Response } from 'node-fetch'

import { GitHubRepo } from './@types/github.js'

class HttpError extends Error {
  response: Response

  constructor(response: Response) {
    super(`${response.status} for ${response.url}`)

    this.name = 'HttpError'
    this.response = response
  }
}

async function loadJson<T>(url: string): Promise<T> {
  return await fetch(url).then(async (response) => {
    if (response.status === 200) {
      return await response.json().then((data) => data as T)
    } else {
      throw new HttpError(response)
    }
  })
}

export async function demoGithubUserRepos() {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  readline.question("Enter a GitHub username? 'marcelotk15': ", async (userName) => {
    loadJson<GitHubRepo[]>(`https://api.github.com/users/${userName}/repos`)
      .then((repos) => {
        console.log(`${userName} has a total of ${repos.length}`)
      })
      .catch((err) => {
        if (err instanceof HttpError && err.response.status === 404) {
          console.warn('No such user, please reenter.')

          return demoGithubUserRepos()
        } else {
          throw err
        }
      })
  })
}

Promise.all([demoGithubUserRepos()])
