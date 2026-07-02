# The Blue Book Club

A community-driven web application where readers discover, suggest, read, and discuss one book together every month.

**Live Demo:**
[https://aria-vero-s.github.io/book-club/](https://aria-vero-s.github.io/book-club/?utm_source=chatgpt.com)

---

## About

The Blue Book Club is designed around a simple monthly reading cycle:

1. **Discover** the current Book of the Month and help decide what the community reads next.
2. **Read** at your own pace and mark the book as finished.
3. **Connect** by unlocking spoiler-safe discussions once you've completed the book.

Unlike traditional book clubs, the next monthly read is chosen by the community through a token-based suggestion and support system.

---

## Features

### Authentication

* Google Sign-In using Firebase Authentication
* Automatic user profile creation
* Future-ready architecture for 42 School OAuth authentication

---

### Monthly Book Club

* One Book of the Month
* Automatic monthly reading cycle
* Automatic archive of previous monthly books
* Permanent "Past Reads" library

---

### Community Suggestions

Members can:

* Suggest books
* Add:

  * Title
  * Author
  * Cover image
  * Description
* Confirmation popup before submission
* Maximum of 3 active suggestions per user
* Suggestions appear instantly in the Community Picks carousel

---

### Influence Token System

Members earn tokens through participation.

**Earn**

* Finish the Book of the Month → **+1 token**
* Another member supports one of your suggestions → **+2 tokens**

**Spend**

* Suggest a new book → **1 token**
* Support another member's suggestion → **1 token**

Toast notifications are displayed whenever tokens are earned, spent, or refunded.

---

### Community Voting

The next Book of the Month is selected automatically.

* Members support book suggestions.
* At the end of each month, the most supported suggestion wins.
* If two or more books tie, a second voting round is automatically created.
* The second round ends when either:

  * 50% of users have voted, or
  * 18 hours have elapsed.

---

### Reading Status

Users can mark the Book of the Month as:

* Reading in Progress
* Finished

Marking a book as finished:

* awards an Influence Token
* unlocks future discussion eligibility
* updates the user's profile

---

### Spoiler-Free Discussions

To protect readers from spoilers:

* Discussions remain locked during the active reading month.
* Only members who marked the book as **Finished** gain access once the month has ended.
* Reviews support threaded replies.
* Reply notifications take users directly to the relevant discussion.

---

### Past Reads

Every previous Book of the Month is archived.

Archived books display:

* Cover
* Title
* Author
* Community rating
* Discussion status

Discussion threads are:

* 🔓 Unlocked if the user finished the book during its reading month.
* 🔒 Locked otherwise.

---

### Notification Center

Real-time notifications include:

* Token earned
* Token spent
* Token refunded
* Someone supported your suggestion
* Someone replied to your review

Notifications link directly to the relevant content.

---

### Monthly Meetup

The club follows a predictable meetup schedule.

**Meetup:**
Last Sunday of every month (date and location specified in a banner)

---

## Tech Stack

* React
* TypeScript
* Firebase Authentication
* Cloud Firestore
* Figma Make
* GitHub Pages

---

## Firestore Collections

```text
users
books
suggestions
supports
readingStatus
reviews
replies
notifications
```

---

## Project Goals

This project explores the design of a community-driven application by combining:

* Authentication
* Real-time database synchronization
* CRUD operations
* Community voting
* Gamified participation
* Notification systems
* Access control
* Responsive UI/UX

The objective is to build a collaborative reading platform that encourages participation while keeping discussions spoiler-free and community-focused.

---

## Future Improvements

* 42 School OAuth login
* Search and filtering
* Reading statistics
* Admin moderation tools (optional)
* Email notifications
* Calendar integration
* Mobile app
* AI-powered book recommendations

---

Developed by **Ariane Saulnier** as a UI/UX and full-stack portfolio project.
