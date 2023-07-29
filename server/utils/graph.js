const Graph = {
  Node: {
    Persona: "Persona",
  },
  Relationship: {
    HasAlias: "HAS_ALIAS",
    AliasOf: "ALIAS_OF",
    // Controls: "CONTROLS", //Replaces MemberOf: "MEMBER_OF",
    Indirect: "INDIRECT_CONTROL",
    Read: "READ_CONTROL",
    Guest: "GUEST_CONTROL",
    User: "USER_CONTROL",
    Admin: "ADMIN_CONTROL",
    Superadmin: "SUPERADMIN_CONTROL",
    System: "SYSTEM_CONTROL",
  }
}

module.exports = { Graph };