# Canchu: A Social Networking Web Application - Backend Web API

## User Features:

### Registration and Login:

- Users can register and log in.
- Upon registration, an access token is generated using JWT (JSON Web Tokens).
- Profile Updates\(Users can update their personal information, including introductions and interests.\)
- User Search\(Users have the ability to search for other users.\)

- Profile Picture Upload\(Users can upload profile pictures, with image storage managed using Multer and Express.static.\)

### Social Networking Features:

- Friendship Management:
    - Users can send or cancel friend requests.
    - They can accept or cancel friend invitations.
     - Users have the option to delete friends.

### Notification System:

- Friendship Requests:
    - Notifications for incoming friend requests.
- Friend Request Acceptance:
    - Notifications for accepted friend requests.

### Article-related Features:

- Post Creation and Editing:
    - Users can create and edit posts.
- Likes and Unlikes:
    - Users can like or unlike posts.
- Post Comments:
    - Users can comment on posts.

- Friend Activity Feed:
    - The feed displays posts from the user and all their friends, sorted from newest to oldest.
    - Pagination is implemented using a cursor-based approach, fetching 10 posts at a time from the database.