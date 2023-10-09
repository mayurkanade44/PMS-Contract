# The PMS Cloud - Pest Managements & Service Contract Portal

The PMS Cloud is a MERN web app used by Pest Managements & Services to create pest control contracts & service cards. Once contract is created user gets automated “Welcome Mail” with digital contract copy & tentative dates of their service on their registered email ids. 3 days prior to service client gets sms/whatsapp/email notification on their provided contact details. Each service card has unique QR code, which helps service technician to quickly & easily update the status after the service with work images, and after updation client gets an email notification of service status on their registered email id. Also end of every 3 months of contract client gets its quarterly report of service done/not-done.

Everyday backend team gets email notification of services that has to be to done prior to 7 days, so they can plan accordingly. Also they can manually generate the service report of desired contract/client. Dashboard with graph representation of monthly service due & can generate month wise service due file.

## Demo

Project in action: [ThePMSCloud](https://thepmscloud.com/)

Video: [Youtube](https://youtu.be/2OMce57A7sY)

Documentation: [PDF](https://res.cloudinary.com/epcorn/image/upload/v1675857316/signature/Contract_QR_wm4giu.pdf)

## Tech Stack

**Client:** React, Redux-Toolkit-Query, Tailwind

**Server:** Node, Express

**Database:** Mongo DB Atlas

**Mail Service:** Brevo / Sendgrid

**Hosting:** Render

## Features

- Contract creation.
- QR based service card.
- Live service status updation by scanning QR code.
- Image upload of work or service card
- Automated quarterly service report to client.
- 3 days prior to service due, SMS/Whatsapp/Email notification to client .
- Automated 7 days service due notification to backend team.
- Dashboard with graph representation of services.
- Cookie based Authentication.
- Role based access to the portal (Admin, Back Office, Technician).
- Client form validation and handling using react-hook-form.
- Full responsiveness.

## Screenshots
