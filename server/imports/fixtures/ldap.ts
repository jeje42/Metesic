
export function initLdap(){
  LDAP_DEFAULTS.url = 'ldap://192.168.0.13'
  LDAP_DEFAULTS.port = 389
  LDAP_DEFAULTS.dn = 'ou=appart,dc=jeje,dc=com'
}

//TOSEE : https://stackoverflow.com/questions/36368457/is-it-possible-to-set-another-users-password-in-meteor-if-you-have-admin-privil
