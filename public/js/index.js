import '../socket.io/socket.io.js'

const issueList = document.querySelector('#issue-list')

// Only create a socket connection if there is an issue list on the page.
if (issueList) {
  // Create a socket connection using Socket.IO.
  const socket = window.io()

  // Listen for "issues/close" message from the server.
  socket.on('issues/close', (issueIid) => changeIssueState('closed', issueIid))

  // Listen for "issues/open" message from the server.
  socket.on('issues/open', (issueIid) => changeIssueState('opened', issueIid))

  // Listen for "issues/create" message from the server.
  socket.on('issues/create', (issue) => createIssue(issue))

  // Listen for "issues/update" message from the server.
  socket.on('issues/update', (issue) => updateIssue(issue))
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
      form.action = `/issues/${issueIid}/open`

      // Change the button text and class
      button.textContent = 'Open issue'
      button.classList.remove('btn-primary', 'btn-opened')
      button.classList.add('btn-secondary', 'btn-closed')
    } else {
      // Change the form action
      form.action = `/issues/${issueIid}/close`

      // Change the button text and class
      button.textContent = 'Close issue'
      button.classList.remove('btn-secondary', 'btn-closed')
      button.classList.add('btn-primary', 'btn-opened')
    }
  }
}

/**
 * Create a new issue in the table.
 *
 * @param {object} issue - The issue object.
 */
function createIssue (issue) {
  // Only add the issue if it already doesn't exist
  if (!issueList.querySelector(`[data-id="${issue.iid}"]`)) {
    console.log(issue)

    const issueNode = document.querySelector('#issue-template').content.cloneNode(true)

    issueNode.querySelector('tr').setAttribute('data-id', issue.iid)

    updateNodeInfo(issueNode, issue)

    issueList.appendChild(issueNode)
  }
}

/**
 * Update an existing issue in the table.
 *
 * @param {object} issue - The issue object.
 */
function updateIssue (issue) {
  const issueNode = issueList.querySelector(`[data-id="${issue.iid}"]`)

  if (issueNode) {
    console.log(issue)

    // Update all the issue information, just because there isn't so much of it right now.
    updateNodeInfo(issueNode, issue)
  }
}

/**
 * Update the issue node with the issue information.
 *
 * @param {object} node - The issue node.
 * @param {object} issue - The issue object.
 */
function updateNodeInfo (node, issue) {
  const [imgCell, titleCell, descriptionCell, stateCell, stateBtnCell] = node.querySelectorAll('td')

  imgCell.querySelector('img').src = issue.ownerAvatar
  titleCell.textContent = issue.title
  descriptionCell.textContent = issue.description
  stateCell.textContent = issue.state

  if (issue.state === 'opened') {
    stateBtnCell.querySelector('form').action = `/issues/${issue.iid}/close`
    stateBtnCell.querySelector('button').textContent = 'Close issue'
    stateBtnCell.querySelector('button').classList.add('btn-primary', 'btn-opened')
  } else {
    stateBtnCell.querySelector('form').action = `/issues/${issue.iid}/open`
    stateBtnCell.querySelector('button').textContent = 'Open issue'
    stateBtnCell.querySelector('button').classList.add('btn-secondary', 'btn-closed')
  }
}
