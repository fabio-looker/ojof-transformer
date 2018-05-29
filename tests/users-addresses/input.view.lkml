view: users {
	sql_table_name: users ;;
	dimension: name {}

#ORION
#	primary_key: user_id {
#		sql: ${TABLE}.id ;;
#	}
#	foreign_key: shipping {
#		to: address_id
#	}
#	foreign_key: billing {
#		to: address_id
#		label: "$"
#	}
}
view: addresses {
	sql_table_name: addresses ;;
	dimension: street {}
#ORION
#	primary_key: address_id {
#		sql: ${TABLE}.id;;
#	}
#	foreign_key: state_id {
#		sql: ${TABLE}.state_id
#	}
}
view: states {
	sql_table_name: states ;;
	dimension: name {
		label: "State"
	}
#ORION
#	primary_key: state_id {
#		sql: ${TABLE}.state ;;
#	}
}