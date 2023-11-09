# How to create an integration

> 1. Investigate the API and see what useful data we can harvest
> 2. Make a list of steps for gathering data
> 3. Define the data mapping

# Heroku Integration

## Data Fetching Process

- Get a list of teams (Team List)
  - Store team

- Loop through each team and get team members (Team Member List)
  - Store Team member and relationship to team
  - Store email (an email persona will be created)

- Loop through each team and get apps (Apps In Team)
  - Store app and relationship to team

- Loop through each app and get collaborators (Team App Collaborator List)
  - Store collaborator (check if exists) and relationship to app. If collaborator already exists add relationship to existing collaborator.

### Team List

Get a list of teams I am a member of.

<https://devcenter.heroku.com/articles/platform-api-reference#team-list>

```bash
curl -n https://api.heroku.com/teams \
  -H "Accept: application/vnd.heroku+json; version=3"
```

### Team Member List

Get a list of members for each team.

<https://devcenter.heroku.com/articles/platform-api-reference#team-member-list>

```bash
curl -n https://api.heroku.com/teams/$TEAM_NAME_OR_ID/members \
  -H "Accept: application/vnd.heroku+json; version=3"
```

### Apps In Team

Get a list of apps for each team.

<https://devcenter.heroku.com/articles/platform-api-reference#team-app-list-by-team>

```bash
curl -n https://api.heroku.com/teams/$TEAM_NAME_OR_ID/apps \
  -H "Accept: application/vnd.heroku+json; version=3"
```

### Team App Collaborator List

List collaborators on a team app.

<https://devcenter.heroku.com/articles/platform-api-reference#team-app-collaborator-list>

```bash
curl -n https://api.heroku.com/teams/apps/$TEAM_APP_NAME/collaborators \
  -H "Accept: application/vnd.heroku+json; version=3"
```

## Data Mapping

### Teams

```https://api.heroku.com/teams```

```javascript
const teams = [
  {
    standardProps: {
      id: id,
      short_name: name,
      platform: "heroku",
      type: "team",
      status: "active",
      friendlyName: `Heroku Team: ${name})`,
    }
    customProps: {
      role: role,
      account_type: type,
      identity_provider: identity_provider,
      membership_limit: membership_limit,
    }
  }
]
```

### Members

Run once per team. Loop through the teams array and pass each team's id.

```https://api.heroku.com/teams/$TEAM_NAME_OR_ID/members```

```javascript
const members = [
  {
    standardProps: {
      id: id,
      name: user.name,
      platform: "heroku",
      type: "member",
      status: "active",
      friendlyName: `Heroku member: ${user.name})`,
    }
    customProps: {
      authentication: member.two_factor_authentication ? "2FA" : "1FA",
    }
    emails: [{
      email: email,
      role: role,
    }]
    controls: [
      {
        role: role,
        upn: `upn:heroku:team:${teamId}`,
      }
    ]
  }
]
```

### Apps

Run once per team. Loop through the teams array and pass each team's id.

```https://api.heroku.com/teams/$TEAM_NAME_OR_ID/apps```

```javascript
const apps = [
  {
    standardProps: {
      id: id,
      name: name,
      platform: "heroku",
      type: "app",
      status: archived_at ? "active" : "suspended",
      friendlyName: `Heroku App: ${name})`,
    },
    customProps: {
      region: region,
      webUrl: web_url,
      gitUrl: git_url,
    },
    emails: [{
      email: owner.email,
      role: "admin",
    }],
    obeys: [
      {
        role: 'admin',
        upn: `upn:heroku:team:${team.id}`,
      }
    ]
  }
]
```

### Collaborators

Run once per app. Loop through the apps array and pass each app's id.

```https://api.heroku.com/teams/apps/$TEAM_APP_NAME/collaborators```

```javascript
const collaborators = [
  {
    standardProps = {
      id: id,
      name: user.email,
      platform: "heroku",
      type: "member",
      status: "active",
      friendlyName: `Heroku Member: ${user.email})`,
    }
    emails: [{
      email: user.email,
      role: role,
    }]
  }
]
```
