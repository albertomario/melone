var Sql = {
	create: {
		key: 'CREATE TEMPORARY TABLE IF NOT EXISTS {{key}} (' +
				'`id` int(11) NOT NULL AUTO_INCREMENT, ' +
				'`key` varchar(32) NOT NULL, ' +
				'`secret` varchar(32) NOT NULL, ' +
				'`created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
				'PRIMARY KEY (`id`) ' +
			') ENGINE=InnoDb DEFAULT CHARSET=utf8;',
		tag: 'CREATE TEMPORARY TABLE IF NOT EXISTS {{tag}} (' +
				'`id` int(10) unsigned NOT NULL AUTO_INCREMENT, ' +
				'`name` varchar(50) NOT NULL, ' +
				'`description` varchar(255) NOT NULL, ' +
				'`created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
				'PRIMARY KEY (`id`) ' +
			') ENGINE=InnoDb DEFAULT CHARSET=utf8;',
		template: 'CREATE TEMPORARY TABLE IF NOT EXISTS {{template}} (' +
				'`id` int(10) unsigned NOT NULL AUTO_INCREMENT, ' +
				'`name` varchar(100) NOT NULL, ' +
				'`description` varchar(255) NOT NULL, ' +
				'`html` text NOT NULL, ' +
				'`plain` text NOT NULL, ' +
				'`created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
				'`updated` timestamp NOT NULL DEFAULT "0000-00-00 00:00:00", ' +
				'PRIMARY KEY (`id`)' +
			') ENGINE=InnoDb DEFAULT CHARSET=utf8;',
		mail: 'CREATE TEMPORARY TABLE IF NOT EXISTS {{mail}} (' +
				'`id` int(10) unsigned NOT NULL AUTO_INCREMENT, ' +
				'`subject` varchar(255) NOT NULL, ' +
				'`sent` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
				'PRIMARY KEY (`id`)' +
			') ENGINE=InnoDB DEFAULT CHARSET=utf8;',
		mail_tag: 'CREATE TEMPORARY TABLE IF NOT EXISTS {{mail_tag}} (' +
				'`mail_id` int(10) unsigned NOT NULL, ' +
				'`tag_id` int(10) unsigned NOT NULL, ' +
				'KEY `mail_id` (`mail_id`), ' +
				'KEY `tag_id` (`tag_id`) ' +
			') ENGINE=InnoDB DEFAULT CHARSET=utf8;',
		mail_to: 'CREATE TEMPORARY TABLE IF NOT EXISTS {{mail_to}} (' +
				'`id` int(10) unsigned NOT NULL AUTO_INCREMENT, ' +
				'`mail_id` int(10) unsigned NOT NULL, ' +
				'`email` varchar(255) NOT NULL, ' +
				'`name` varchar(100) DEFAULT NULL, ' +
				'`opened` timestamp NULL DEFAULT "0000-00-00 00:00:00", ' +
				'PRIMARY KEY (`id`), ' +
				'KEY `mail_id` (`mail_id`), ' +
				'KEY `mail_id_2` (`mail_id`) ' +
			') ENGINE=InnoDB DEFAULT CHARSET=utf8;',
		mail_link: 'CREATE TEMPORARY TABLE IF NOT EXISTS {{mail_link}} (' +
				'`id` int(10) unsigned NOT NULL AUTO_INCREMENT, ' +
				'`mail_to_id` int(10) unsigned NOT NULL, ' +
				'`url` varchar(255) NOT NULL, ' +
				'`plain` tinyint(1) NOT NULL DEFAULT "0", ' +
				'PRIMARY KEY (`id`), ' +
				'KEY `mail_to_id` (`mail_to_id`) ' +
			') ENGINE=InnoDB DEFAULT CHARSET=utf8;',
		mail_link_click: 'CREATE TEMPORARY TABLE IF NOT EXISTS {{mail_link_click}} (' +
				'`id` int(10) unsigned NOT NULL AUTO_INCREMENT, ' +
				'`mail_link_id` int(10) unsigned NOT NULL, ' +
				'`ip_hash` varchar(64) NOT NULL, ' +
				'`clicked` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, ' +
				'PRIMARY KEY (`id`), ' +
				'KEY `mail_link_id` (`mail_link_id`) ' +
			') ENGINE=InnoDB DEFAULT CHARSET=utf8;'
	},

	foreign_keys: [
		'ALTER TABLE {{mail_link}} ' +
			'ADD CONSTRAINT {{mail_link_ibfk_1}} FOREIGN KEY (`mail_to_id`) REFERENCES {{mail_to}} (`id`);',
		'ALTER TABLE {{mail_link_click}} ' +
			'ADD CONSTRAINT {{mail_link_click_ibfk_1}} FOREIGN KEY (`mail_link_id`) REFERENCES {{mail_link}} (`id`);',
		'ALTER TABLE {{mail_tag}} ' +
			'ADD CONSTRAINT {{mail_tag_ibfk_2}} FOREIGN KEY (`tag_id`) REFERENCES {{tag}} (`id`), ' +
			'ADD CONSTRAINT {{mail_tag_ibfk_1}} FOREIGN KEY (`mail_id`) REFERENCES {{mail}} (`id`);',
		'ALTER TABLE {{mail_to}} ' +
			'ADD CONSTRAINT {{mail_to_ibfk_1}} FOREIGN KEY (`mail_id`) REFERENCES {{mail}} (`id`);'
	],

	remove: {
		mail_link_click: 'DROP TEMPORARY TABLE IF EXISTS {{mail_link_click}};',
		mail_link: 'DROP TEMPORARY TABLE IF EXISTS {{mail_link}};',
		mail_tag: 'DROP TEMPORARY TABLE IF EXISTS {{mail_tag}};',
		mail_to: 'DROP TEMPORARY TABLE IF EXISTS {{mail_to}};',
		mail: 'DROP TEMPORARY TABLE IF EXISTS {{mail}};',
		key: 'DROP TEMPORARY TABLE IF EXISTS {{key}};',
		tag: 'DROP TEMPORARY TABLE IF EXISTS {{tag}};',
		template: 'DROP TEMPORARY TABLE IF EXISTS {{template}};'
	}
};

module.exports = Sql;