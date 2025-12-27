Update ProjectsPage.tsx to fetch real project data from the API instead of using dummy data from getProjects().
Key changes required:

Replace the current useEffect that calls getProjects() and getTeams() with a proper API call to fetch the user's projects.
Use the existing apiService and endpoints.getUserProjects (already imported) to fetch the data.
The API returns an array of projects where each project has this structure (example provided below).
Map the API response to match what the current UI expects (especially title, description, tech_stack, status, etc.), or update the UI to work directly with the real fields.
When a user clicks on a project card (the "View" button or the card itself), navigate to a detailed project view and display a beautiful, smart, modern UI showing all available project details e.g in tabs nice very nice UI, including:
Project name, description, avatar (base64 image)
Problem statement, solution description, target users, innovation notes
Tech stack (as badges)
GitHub repositories (with clickable links)
Team information: name, description, list of team members (with names, roles if available, and status)
Project status and submission date
Any status change history or approvals (optional, but nice if shown in a timeline)
Data from the api looks like {
"id": "f1c5df41-1723-45a4-8ea7-e610f8563ead",
"name": "Testing Project Full 1",
"description": "Testing Project Full",
"avatar": "data:image/png;base64.......5CYII=",
"problemStatement": "Ut sit harum culpa debitis dolor perferendis quaerat non officia vero alias velit repellendus Aperiam asperiores dolore cumque ipsam officiis",
"solutionDescription": "Voluptas sunt in doloribus in laborum Similique quo nemo odio culpa dolor illo et",
"targetUsers": "Vitae est provident do dolores nulla quasi quidem elit culpa placeat fugit eos minima cumque animi voluptas aperiam similique",
"innovationNotes": "Est in nulla voluptas quod magni",
"techStack": [
"React",
"Python",
"JavaScript"
],
"githubRepos": [
{
"name": "Frontedn Url",
"url": "https://github.com/username/repository"
},
{
"name": "Backend",
"url": "https://github.com/username/repository"
}
],
"team": {
"id": "0a06e2d7-ab94-4381-8760-baf90391c10f",
"name": "AI Innovators",
"description": "AI innovators UI",
"createdAt": "2025-12-26T09:57:16.651+00:00",
"visibility": null,
"updatedAt": "2025-12-26T09:57:16.651+00:00",
"teamMembers": [
{
"id": "ae50ffee-0afd-471c-8086-94e294d14cdd",
"inviterProvidedName": null,
"joinedAt": "2025-12-26T09:57:16.803+00:00",
"status": "ACTIVE",
"isOwner": true,
"role": null,
"username": "superadmin",
"firstName": "Admin",
"lastName": "Super",
"email": "superadmin@zanari.com",
"userId": "68203aa4-651e-45b9-bd25-42877ca18af4"
},
{
"id": "3783b696-f661-4980-bb46-10eeb41abb76",
"inviterProvidedName": null,
"joinedAt": "2025-12-26T10:52:09.171+00:00",
"status": "INVITED_USER_PENDING_ACCEPTANCE",
"isOwner": false,
"role": {
"id": "bde1c98b-5b21-49cd-91fa-dafb1e56b555",
"name": "Member",
"permissions": [
{
"id": "a35b130c-1b4f-41e2-bcdc-f607706b23b1",
"name": "removeMembers",
"section": "team",
"enabled": false
},
{
"id": "6d2c3d3f-eff1-4196-8981-d6f16343ef39",
"name": "inviteMembers",
"section": "team",
"enabled": false
},
{
"id": "44f7e78e-e2d7-4bdf-8701-f17dab4a429e",
"name": "createProject",
"section": "projects",
"enabled": true
},
{
"id": "2642cba2-7d10-48ee-8faa-0e5d30db8895",
"name": "uploadFiles",
"section": "submissions",
"enabled": true
},
{
"id": "f09e03c5-5c49-427a-91d6-19227dc6e554",
"name": "chat",
"section": "communication",
"enabled": true
},
{
"id": "b853db0a-9184-4e5b-a234-bff2ee12569f",
"name": "submitProject",
"section": "projects",
"enabled": false
},
{
"id": "544beecf-7608-42d1-b452-121054795140",
"name": "editProject",
"section": "projects",
"enabled": true
},
{
"id": "6c588b3d-2130-49e2-89d9-44e7b001362d",
"name": "postUpdates",
"section": "communication",
"enabled": true
},
{
"id": "e1593597-9301-4b5d-a777-6652d2cdd41e",
"name": "manageTeamSettings",
"section": "team",
"enabled": false
},
{
"id": "b02cc8c9-6e1c-4c67-8593-f9804c34768d",
"name": "editSubmission",
"section": "submissions",
"enabled": true
},
{
"id": "255b22eb-8c38-4c24-9db6-06dcbfd5ee4d",
"name": "addDemoLink",
"section": "submissions",
"enabled": true
},
{
"id": "6e237122-eb76-47ee-9853-663a9422c340",
"name": "mentorContact",
"section": "communication",
"enabled": true
},
{
"id": "636fe86d-1c39-4fd1-9e1e-9bd92daa6813",
"name": "assignRoles",
"section": "team",
"enabled": false
},
{
"id": "bb49c635-0282-4c3a-aec3-3335468b66af",
"name": "viewFeedback",
"section": "submissions",
"enabled": true
},
{
"id": "28a87112-291f-4ebb-a43f-9b56a222c94b",
"name": "deleteProject",
"section": "projects",
"enabled": false
}
]
},
"username": "Test",
"firstName": "Jasmine",
"lastName": "Benton",
"email": "ruwilik@mailinator.com",
"userId": "d36abcb0-b17a-4118-916e-b1d4f3995fd5"
}
],
"allTeamRoles": [
{
"id": "bde1c98b-5b21-49cd-91fa-dafb1e56b555",
"name": "Member",
"permissions": [
{
"id": "a35b130c-1b4f-41e2-bcdc-f607706b23b1",
"name": "removeMembers",
"section": "team",
"enabled": false
},
{
"id": "6d2c3d3f-eff1-4196-8981-d6f16343ef39",
"name": "inviteMembers",
"section": "team",
"enabled": false
},
{
"id": "44f7e78e-e2d7-4bdf-8701-f17dab4a429e",
"name": "createProject",
"section": "projects",
"enabled": true
},
{
"id": "2642cba2-7d10-48ee-8faa-0e5d30db8895",
"name": "uploadFiles",
"section": "submissions",
"enabled": true
},
{
"id": "f09e03c5-5c49-427a-91d6-19227dc6e554",
"name": "chat",
"section": "communication",
"enabled": true
},
{
"id": "b853db0a-9184-4e5b-a234-bff2ee12569f",
"name": "submitProject",
"section": "projects",
"enabled": false
},
{
"id": "544beecf-7608-42d1-b452-121054795140",
"name": "editProject",
"section": "projects",
"enabled": true
},
{
"id": "6c588b3d-2130-49e2-89d9-44e7b001362d",
"name": "postUpdates",
"section": "communication",
"enabled": true
},
{
"id": "e1593597-9301-4b5d-a777-6652d2cdd41e",
"name": "manageTeamSettings",
"section": "team",
"enabled": false
},
{
"id": "b02cc8c9-6e1c-4c67-8593-f9804c34768d",
"name": "editSubmission",
"section": "submissions",
"enabled": true
},
{
"id": "255b22eb-8c38-4c24-9db6-06dcbfd5ee4d",
"name": "addDemoLink",
"section": "submissions",
"enabled": true
},
{
"id": "6e237122-eb76-47ee-9853-663a9422c340",
"name": "mentorContact",
"section": "communication",
"enabled": true
},
{
"id": "636fe86d-1c39-4fd1-9e1e-9bd92daa6813",
"name": "assignRoles",
"section": "team",
"enabled": false
},
{
"id": "bb49c635-0282-4c3a-aec3-3335468b66af",
"name": "viewFeedback",
"section": "submissions",
"enabled": true
},
{
"id": "28a87112-291f-4ebb-a43f-9b56a222c94b",
"name": "deleteProject",
"section": "projects",
"enabled": false
}
]
},
{
"id": "2cd80c37-0f8d-40d3-a3a5-74d375f9f0a2",
"name": "Viewer",
"permissions": [
{
"id": "c84552b5-f494-435c-9ab2-0c2acd0db547",
"name": "mentorContact",
"section": "communication",
"enabled": false
},
{
"id": "35d5364a-f6c4-4703-95df-d8537cd94190",
"name": "viewFeedback",
"section": "submissions",
"enabled": true
},
{
"id": "ffefe8ab-f835-484e-a81b-0e0b752ff30b",
"name": "createProject",
"section": "projects",
"enabled": false
},
{
"id": "f99843d9-d2e7-4523-9bff-717405eff9fd",
"name": "editProject",
"section": "projects",
"enabled": false
},
{
"id": "af76760b-a51c-468e-a20f-14b00c3b3b1a",
"name": "removeMembers",
"section": "team",
"enabled": false
},
{
"id": "39fc3177-b061-4145-924c-d908fd05de8f",
"name": "submitProject",
"section": "projects",
"enabled": false
},
{
"id": "6449219e-2af1-463c-8302-634ba49005a4",
"name": "deleteProject",
"section": "projects",
"enabled": false
},
{
"id": "5f99872d-cd7d-4fc8-bf27-3513d0e4d7bf",
"name": "uploadFiles",
"section": "submissions",
"enabled": false
},
{
"id": "358454bd-b437-4c18-aacd-5ffba528b950",
"name": "chat",
"section": "communication",
"enabled": true
},
{
"id": "32916098-d11c-487a-9499-9caaec2d61ee",
"name": "inviteMembers",
"section": "team",
"enabled": false
},
{
"id": "1a0ff8c0-a951-4194-bae1-de32be43fc64",
"name": "postUpdates",
"section": "communication",
"enabled": false
},
{
"id": "8e450287-f784-4bcb-9fd1-e8ca8eabea66",
"name": "editSubmission",
"section": "submissions",
"enabled": false
},
{
"id": "f8ad05ac-159c-4713-ae1b-0fbe8c70ac4d",
"name": "assignRoles",
"section": "team",
"enabled": false
},
{
"id": "bb06ff3d-e1da-4e9b-9c87-7a6788d714eb",
"name": "addDemoLink",
"section": "submissions",
"enabled": false
},
{
"id": "69f5a543-684b-4992-9302-33f88dd37b59",
"name": "manageTeamSettings",
"section": "team",
"enabled": false
}
]
},
{
"id": "150799ae-1751-4338-b924-b644690f5ddf",
"name": "Team Lead",
"permissions": [
{
"id": "190f758e-194d-4fc4-95af-3e568df4c27e",
"name": "addDemoLink",
"section": "submissions",
"enabled": true
},
{
"id": "75121cd4-2939-465d-acdd-16b6b02f9779",
"name": "viewFeedback",
"section": "submissions",
"enabled": true
},
{
"id": "7f54e357-01b7-4b79-ada4-3203e2b700d4",
"name": "submitProject",
"section": "projects",
"enabled": true
},
{
"id": "2733cd88-953f-4348-bab3-8680f2b60551",
"name": "editSubmission",
"section": "submissions",
"enabled": true
},
{
"id": "b0c11eb2-b247-490d-93bc-6f89380a502a",
"name": "removeMembers",
"section": "team",
"enabled": true
},
{
"id": "3d72b36b-9f1b-4011-84c0-2f08aba4bf1d",
"name": "editProject",
"section": "projects",
"enabled": true
},
{
"id": "35222f88-eb01-47b2-9c80-bcefdf3c10f4",
"name": "mentorContact",
"section": "communication",
"enabled": true
},
{
"id": "4c2baaee-d651-4cc0-b173-26d46144465f",
"name": "createProject",
"section": "projects",
"enabled": true
},
{
"id": "66ad9121-c91f-4484-ae19-ce8786a1f15c",
"name": "postUpdates",
"section": "communication",
"enabled": true
},
{
"id": "29977a5c-840f-49df-8cdc-11f8f750bbd7",
"name": "assignRoles",
"section": "team",
"enabled": true
},
{
"id": "65dc8266-8506-4f31-8c23-f657972d3151",
"name": "chat",
"section": "communication",
"enabled": true
},
{
"id": "9bab46e3-0c44-47fb-9125-b7ed08c6e0ab",
"name": "inviteMembers",
"section": "team",
"enabled": true
},
{
"id": "64005237-2891-4728-be59-93685250e5a6",
"name": "deleteProject",
"section": "projects",
"enabled": true
},
{
"id": "b5a21772-9db9-4c67-a1ab-39d54e5388e4",
"name": "uploadFiles",
"section": "submissions",
"enabled": true
},
{
"id": "2b7ca867-d929-4d37-bce0-33e53d246d16",
"name": "manageTeamSettings",
"section": "team",
"enabled": true
}
]
}
]
},
"status": "PENDING_REVIEW",
"submittedAt": "2025-12-27T12:45:08.8799488",
"projectStatusChanges": [
{
"id": "2c208813-9e32-4954-9499-0a4ab74dddfd",
"changedBy": {
"id": "68203aa4-651e-45b9-bd25-42877ca18af4",
"username": "superadmin",
"firstName": "Admin",
"lastName": "Super",
"phoneNumber": null,
"age": null,
"location": null,
"password": "$2a$10$360VRXCF07P./8TRv1jIAejGfHSM3mry26PgwsksMoS91LQ3vqGZG",
"defaultPasswordChanged": null,
"otp": null,
"email": "superadmin@zanari.com",
"profilePicture": null,
"createdAt": "2025-10-27 10:23:00.697189",
"updatedAt": "2025-12-27 09:59:59.495434",
"status": "ACTIVE",
"userProfile": null,
"token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI2ODIwM2FhNC02NTFlLTQ1YjktYmQyNS00Mjg3N2NhMThhZjQiLCJlbWFpbCI6InN1cGVyYWRtaW5AemFuYXJpLmNvbSIsInN1YiI6InN1cGVyYWRtaW4iLCJpYXQiOjE3NjY4MTg3OTksImV4cCI6MTc2Njg1NDc5OX0.RcvBPe0eBzvzG6FbzswYjZ58IW5Me2yOjK-XP-UzuFY",
"refresh_token": null,
"enabled": true,
"authorities": [],
"accountNonLocked": true,
"credentialsNonExpired": true,
"accountNonExpired": true,
"role": "Admin"
},
"previousStatus": "DRAFT",
"newStatus": "PENDING_REVIEW",
"statusType": "PROJECT_STATUS",
"reason": null,
"changedAt": "2025-12-27T12:45:08.8814003"
}
],
"projectApprovals": [
{
"id": "2494d374-e19b-4bdf-a6fc-9f594e3b404f",
"reviewer": null,
"action": "SUBMITTED",
"comments": "Project submitted for review",
"actionDate": "2025-12-27T12:45:08.8814003"
}
]
}
