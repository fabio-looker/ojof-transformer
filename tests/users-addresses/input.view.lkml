view: users {
	sql_table_name: users ;;
	dimension: name {}

#ORION
#	primary_key: user {
#		sql: ${TABLE}.id ;;
#	}
#	foreign_key: shipping_address {
#		to: address
#		as: shipping
#		sql: ${TABLE}.shipping_id ;;
#	}
#	foreign_key: billing_address {
#		to: address
#		as: billing
#		sql: ${TABLE}.billing_id ;;
#		label: "$"
#	}
}
view: addresses {
	sql_table_name: addresses ;;
	dimension: street {}
#ORION
#	weak: yes
#	primary_key: address {
#		sql: ${TABLE}.id;;
#	}
#	foreign_key: state {
#		sql: ${TABLE}.state_id ;;
#	}
}

view: states {
	sql_table_name: states ;;
	dimension: name {
		label: "State"
	}
#ORION
#	weak: yes
#	primary_key: state {
#		sql: ${TABLE}.id ;;
#	}
}
