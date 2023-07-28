const Graph = {
  Node: {
    Persona: "Persona",
  },
  Relationship: {
    HasAlias: "HAS_ALIAS",
    AliasOf: "ALIAS_OF",
    Controls: "CONTROLS", //Replaces MemberOf: "MEMBER_OF",
    Reader: "READER",
    Guest: "GUEST",
    User: "USER",
    Admin: "ADMIN",
    Superadmin: "SUPERADMIN",
    Indirect: "INDIRECT",
    System: "SYSTEM",
  }
}

module.exports = { Graph };