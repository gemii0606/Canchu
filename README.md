# Canchu: A Social Networking Web Application

# Introduction
Canchu is an interactive social community platform that offers users the freedom to create accounts and personalize their profiles by updating their bios and uploading profile pictures. Furthermore, users can engage in discussions by leaving comments and expressing their approval through likes on others' posts. The platform also boasts a dynamic feed feature that showcases recent posts from users and their friends, providing an up-to-date and engaging experience.

## Backend Web API
### User Features:

- Registration and Login:
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

### Additional Technical Skills and Services:

- Nginx for Handling Connection Issues:
    - Skilled in using Nginx to manage and address connection-related issues.
- MySQL Database Operations:
    - Experienced in performing operations and tasks on MySQL databases.
- Docker for Rapid Deployment:
    - Proficient in using Docker for efficient and rapid application deployment.
- Testing and Quality Assurance:
    - Expertise in various testing methodologies, including:
        - Unit Testing (Jest): Proficient in writing unit tests using Jest.
        - Stress Testing (K6): Experienced in conducting stress tests with K6.
        - CI/CD (GitHub Actions): Skilled in setting up Continuous Integration and Continuous Deployment pipelines using GitHub Actions.
