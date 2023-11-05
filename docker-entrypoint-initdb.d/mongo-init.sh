set -e

mongo <<EOF

db = db.getSiblingDB('healthy-food-delivery')

db.createUser({
	user: 'jeeraffo',
	pwd: 'password',
	roles: [
		{
			role: 'userAdminAnyDatabase',
			db: 'healthy-food-delivery',
		},
	],
});

EOF
