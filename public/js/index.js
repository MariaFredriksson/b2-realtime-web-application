import '../socket.io/socket.io.js'

const issueList = document.querySelector('#issue-list')

// Only create a socket connection if there is an issue list on the page.
if (issueList) {
  // Create a socket connection using Socket.IO.
  const socket = window.io()

  // Listen for "snippet/close" message from the server.
  socket.on('snippet/close', (issueIid) => changeIssueState('closed', issueIid))

  // Listen for "snippet/open" message from the server.
  socket.on('snippet/open', (issueIid) => changeIssueState('opened', issueIid))
}

/**
 * Change the issue state in the table.
 *
 * @param {string} newState The new state of the issue.
 * @param {number} issueIid The issue ID.
 */
function changeIssueState (newState, issueIid) {
  console.log('Hej!')

  console.log(issueList)
  console.log(issueIid)

  // Find the corresponding row in the table using the issueId
  const issueRow = issueList.querySelector(`[data-id="${issueIid}"]`)

  console.log(issueRow)

  if (issueRow) {
    // Update the issue state in the table
    const stateCell = issueRow.querySelector('.state-column')
    stateCell.textContent = newState

    const form = issueRow.querySelector('form')
    const button = issueRow.querySelector('button')

    if (newState === 'closed') {
      // Change the form action
      form.action = `/snippets/${issueIid}/open`

      // Change the button text and class
      button.textContent = 'Open issue'
      button.classList.remove('btn-primary', 'btn-opened')
      button.classList.add('btn-secondary', 'btn-closed')
    } else {
      // Change the form action
      form.action = `/snippets/${issueIid}/close`

      // Change the button text and class
      button.textContent = 'Close issue'
      button.classList.remove('btn-secondary', 'btn-closed')
      button.classList.add('btn-primary', 'btn-opened')
    }
  }
}
