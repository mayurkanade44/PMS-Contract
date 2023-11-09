# The PMS Cloud - Pest Managements & Service Contract Portal

The PMS Cloud is a MERN web app used by Pest Managements & Services to create pest control contracts & service cards. Once contract is created user gets an automated “Welcome Mail” with digital contract copy & tentative dates of their service on their registered email ids. 3 days prior to service client gets sms/whatsapp/email notification on their provided contact details. Each service card has a unique QR code, which helps service technician to quickly & easily update the status after the service with work images, and after updation client gets an email notification of service status on their registered email id. Also, at the end of every 3 months of contract client gets its quarterly report of service done/not-done.

Everyday backend team gets email notification of services that has to be to done prior to 7 days, so they can plan accordingly. Also they can manually generate the service report of the desired contract/client. Dashboard with graph representation of monthly service due & can generate month wise service due file. Also has contract expiry file genartion option to get contract expired on selected to-from duration.

## Demo

Project in action: [ThePMSCloud](https://thepmscloud.com/)

Documentation: [PDF](https://res.cloudinary.com/dfwrfkwtr/image/upload/v1699520890/pms/PMS_yvzbki.pdf)

## Tech Stack

**Client:** React, Redux-Toolkit-Query, Tailwind

**Server:** Node, Express

**Database:** Mongo DB Atlas

**Mail Service:** Brevo / Sendgrid

**Hosting:** Render

## Features

- Contract creation.
- QR based service card.
- Automated New contract & renewal contract email with digital contract copy.
- Live service status updation by scanning QR code.
- Image upload of work or service card.
- Automated Service done email notification to the client with job images.
- Automated quarterly service report to client.
- 3 days prior to service due, SMS/Whatsapp/Email notification to client.
- Automated 7 days service due notification to backend team.
- Service Report, Monthly Report & Contract Expiry file generation.
- Dashboard with graph representation of services.
- Cookie-based Authentication.
- Role-based portal access (Admin, Back Office, Technician).
- Client form validation and handling using react-hook-form.
- Full responsiveness.

## Screenshots

Home Page
![App Screenshot](https://res.cloudinary.com/dfwrfkwtr/image/upload/v1699521303/pms/Screenshot_2023-11-07_180217_rseq2w.png)

New Contract Form
![App Screenshot](https://res.cloudinary.com/dfwrfkwtr/image/upload/v1699521311/pms/Screenshot_2023-11-07_180520_oxgbvd.png)

Contract Details Page
![App Screenshot](https://res.cloudinary.com/dfwrfkwtr/image/upload/v1699521321/pms/Screenshot_2023-11-07_182529_pjdg4n.png)

Service Update Page(Mobile)
![App Screenshot](https://res.cloudinary.com/dfwrfkwtr/image/upload/v1699521477/pms/Screenshot_20231109-113659_Chrome_wkzht5.jpg)

Dashboard Page
![App Screenshot](https://res.cloudinary.com/dfwrfkwtr/image/upload/v1699521505/pms/Screenshot_2023-11-09_120301_ootuox.png)

Admin Page
![App Screenshot](https://res.cloudinary.com/dfwrfkwtr/image/upload/v1699521518/pms/Screenshot_2023-11-09_121923_yndgu2.png)

