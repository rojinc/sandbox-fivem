/** Sample data for `npm run dev` (generated with the preview scenarios). */
import { mockNui } from '@sandbox/ui-kit/nui';

const dev = {
    "messages": [
        {
            "type": "SET_APPS",
            "data": {
                "lsunderground": {
                    "name": "lsunderground",
                    "storeLabel": "LS UNDG",
                    "label": "LS UNDG",
                    "icon": "user-secret",
                    "color": "#E95200",
                    "params": ":tab?",
                    "hidden": false,
                    "canUninstall": true,
                    "store": true,
                    "unread": 0,
                    "restricted": {
                        "state": [
                            "ACCESS_LSUNDERGROUND",
                            "PHONE_VPN",
                            "RACE_DONGLE"
                        ]
                    }
                },
                "teams": {
                    "name": "teams",
                    "storeLabel": "Teams",
                    "label": "Teams",
                    "icon": "people-group",
                    "color": "#00FF8A",
                    "hidden": false,
                    "canUninstall": true,
                    "store": true,
                    "unread": 0
                },
                "bizwiz": {
                    "name": "bizwiz",
                    "storeLabel": "BizWiz",
                    "label": "BizWiz",
                    "icon": "business-time",
                    "color": "#135dd8",
                    "hidden": false,
                    "canUninstall": true,
                    "store": true,
                    "unread": 0
                },
                "settings": {
                    "name": "settings",
                    "storeLabel": "Settings",
                    "label": "Settings",
                    "icon": "gear",
                    "color": "#18191e",
                    "params": "",
                    "canUninstall": false,
                    "store": true,
                    "unread": 0,
                    "requirements": []
                },
                "internet": {
                    "name": "internet",
                    "storeLabel": "Interwebz",
                    "label": "Interwebz",
                    "icon": "spider-web",
                    "color": "#1db5e7",
                    "params": "",
                    "canUninstall": false,
                    "store": true,
                    "unread": 0,
                    "requirements": [],
                    "fake": true
                },
                "files": {
                    "name": "files",
                    "storeLabel": "Files",
                    "label": "Files",
                    "icon": "folder-open",
                    "color": "#D8A71E",
                    "params": "",
                    "canUninstall": false,
                    "store": true,
                    "unread": 0,
                    "requirements": [],
                    "fake": true
                }
            }
        },
        {
            "type": "SET_TIME",
            "data": {
                "hour": 21,
                "minute": 37
            }
        },
        {
            "type": "SET_DATA",
            "data": {
                "type": "player",
                "data": {
                    "Source": 7,
                    "SID": 1042,
                    "First": "Mia",
                    "Last": "Thornton",
                    "Phone": "555-0142",
                    "Jobs": [
                        {
                            "Id": "hayes",
                            "Name": "Hayes Autos",
                            "Workplace": {
                                "Id": "hayes",
                                "Name": "Hayes Autos"
                            },
                            "Grade": {
                                "Id": "manager",
                                "Name": "Shop manager"
                            }
                        }
                    ],
                    "States": [
                        "LAPTOP",
                        "PHONE_VPN",
                        "ACCESS_LSUNDERGROUND",
                        "RACE_DONGLE"
                    ],
                    "Profiles": {
                        "redline": {
                            "name": "Nightjar"
                        }
                    },
                    "Reputations": {
                        "Racing": 8800,
                        "Chopping": 26500,
                        "Boosting": 8200
                    },
                    "LaptopApps": {
                        "home": [
                            "settings",
                            "files",
                            "internet",
                            "bizwiz",
                            "teams",
                            "lsunderground"
                        ],
                        "installed": [
                            "settings",
                            "files",
                            "internet",
                            "bizwiz",
                            "teams",
                            "lsunderground"
                        ]
                    },
                    "LaptopSettings": {
                        "wallpaper": "wallpaper",
                        "texttone": "notification.ogg",
                        "colors": {
                            "accent": "#1a7cc1"
                        },
                        "zoom": 75,
                        "volume": 100,
                        "notifications": true,
                        "appNotifications": []
                    },
                    "LaptopPermissions": {
                        "lsunderground": {
                            "admin": false
                        },
                        "redline": {
                            "create": false
                        }
                    },
                    "BoostingContracts": [
                        {
                            "id": 41,
                            "owner": {
                                "SID": 1042,
                                "Alias": "Nightjar"
                            },
                            "vehicle": {
                                "vehicle": "zentorno",
                                "label": "Pegassi Zentorno",
                                "make": "Pegassi",
                                "model": "Zentorno",
                                "class": "A",
                                "classLevel": 4,
                                "tracker": 2
                            },
                            "prices": {
                                "standard": {
                                    "price": 40,
                                    "coin": "VRM"
                                }
                            },
                            "expires": Math.floor(Date.now() / 1000) + 15840
                        },
                        {
                            "id": 42,
                            "owner": {
                                "SID": 1042,
                                "Alias": "Nightjar"
                            },
                            "vehicle": {
                                "vehicle": "sultan",
                                "label": "Karin Sultan",
                                "make": "Karin",
                                "model": "Sultan",
                                "class": "C",
                                "classLevel": 2,
                                "tracker": 0
                            },
                            "prices": {
                                "standard": {
                                    "price": 14,
                                    "coin": "VRM"
                                }
                            },
                            "expires": Math.floor(Date.now() / 1000) + 9300
                        },
                        {
                            "id": 43,
                            "owner": {
                                "SID": 1042,
                                "Alias": "Nightjar"
                            },
                            "vehicle": {
                                "vehicle": "elegy2",
                                "label": "Annis Elegy RH8",
                                "make": "Annis",
                                "model": "Elegy RH8",
                                "class": "B",
                                "classLevel": 3,
                                "rare": true,
                                "tracker": 1
                            },
                            "prices": {
                                "standard": {
                                    "price": 22,
                                    "coin": "VRM"
                                }
                            },
                            "expires": Math.floor(Date.now() / 1000) + 3020
                        },
                        {
                            "id": 44,
                            "owner": {
                                "SID": 1042,
                                "Alias": "Nightjar"
                            },
                            "vehicle": {
                                "vehicle": "blista",
                                "label": "Dinka Blista",
                                "make": "Dinka",
                                "model": "Blista",
                                "class": "D",
                                "classLevel": 1,
                                "tracker": 0
                            },
                            "prices": {
                                "standard": {
                                    "price": 8,
                                    "coin": "VRM"
                                }
                            },
                            "expires": Math.floor(Date.now() / 1000) + 17100
                        }
                    ]
                }
            }
        },
        {
            "type": "SET_DATA",
            "data": {
                "type": "onDuty",
                "data": "hayes"
            }
        },
        {
            "type": "SET_DATA",
            "data": {
                "type": "JobPermissions",
                "data": {
                    "hayes": {
                        "TABLET_VIEW_DOCUMENT": true,
                        "TABLET_CREATE_DOCUMENT": true,
                        "TABLET_PIN_DOCUMENT": true,
                        "TABLET_DELETE_DOCUMENT": true,
                        "TABLET_CREATE_RECEIPT": true,
                        "TABLET_MANAGE_RECEIPT": true,
                        "TABLET_CLEAR_RECEIPT": true,
                        "TABLET_CREATE_NOTICE": true,
                        "TABLET_DELETE_NOTICE": true,
                        "TABLET_TWEET": true,
                        "JOB_MANAGEMENT": true,
                        "FLEET_MANAGEMENT": true
                    }
                }
            }
        },
        {
            "type": "SET_DATA",
            "data": {
                "type": "businessLogo",
                "data": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZDhhNzFlIi8+PHBhdGggZD0iTTE0IDQ2VjE4aDh2MTFoMjBWMThoOHYyOGgtOFYzNkgyMnYxMHoiIGZpbGw9IiMxODFhMWQiLz48L3N2Zz4="
            }
        },
        {
            "type": "SET_DATA",
            "data": {
                "type": "businessPages",
                "data": [
                    {
                        "id": "Dashboard",
                        "icon": [
                            "fas",
                            "house"
                        ],
                        "label": "Dashboard"
                    },
                    {
                        "id": "Search/Document",
                        "icon": [
                            "fas",
                            "file-lines"
                        ],
                        "label": "Documents",
                        "permission": "TABLET_VIEW_DOCUMENT"
                    },
                    {
                        "id": "View/Document",
                        "hidden": true
                    },
                    {
                        "id": "View/Receipt",
                        "hidden": true
                    },
                    {
                        "id": "Create/Document",
                        "hidden": true
                    },
                    {
                        "id": "Create/Notice",
                        "hidden": true
                    },
                    {
                        "id": "Create/Receipt",
                        "hidden": true
                    },
                    {
                        "id": "Search/Receipt",
                        "icon": [
                            "fas",
                            "money-check-dollar"
                        ],
                        "label": "Receipts"
                    },
                    {
                        "id": "Search/ReceiptCount",
                        "icon": [
                            "fas",
                            "money-check-dollar"
                        ],
                        "label": "Receipts Count",
                        "permission": "TABLET_MANAGE_RECEIPT"
                    },
                    {
                        "id": "Tweet",
                        "icon": [
                            "fas",
                            "face-awesome"
                        ],
                        "label": "Business Spammer",
                        "permission": "TABLET_TWEET"
                    },
                    {
                        "id": "TweetSettings",
                        "icon": [
                            "fas",
                            "face-awesome"
                        ],
                        "label": "Spammer Profile",
                        "permission": "JOB_MANAGEMENT"
                    },
                    {
                        "id": "FleetManagement",
                        "icon": [
                            "fas",
                            "cars"
                        ],
                        "label": "Fleet Management",
                        "permission": "FLEET_MANAGEMENT"
                    }
                ]
            }
        },
        {
            "type": "SET_DATA",
            "data": {
                "type": "businessNotices",
                "data": [
                    {
                        "_id": "n1",
                        "job": "hayes",
                        "time": Date.now() + -2700000,
                        "title": "Repair prices from Monday",
                        "description": "<p>Full repairs go up to <b>$1,250</b>. Regular repairs stay at $600. Write the new prices on every receipt.</p>",
                        "author": {
                            "SID": 1042,
                            "First": "Mia",
                            "Last": "Thornton"
                        }
                    },
                    {
                        "_id": "n2",
                        "job": "hayes",
                        "time": Date.now() + -90000000,
                        "title": "Tow truck keys",
                        "description": "<p>Keys go back in the lockbox at the end of every shift.</p>",
                        "author": {
                            "SID": 2210,
                            "First": "Dev",
                            "Last": "Okafor"
                        }
                    },
                    {
                        "_id": "n3",
                        "job": "hayes",
                        "time": Date.now() + -260000000,
                        "title": "Weekend roster",
                        "description": "<ul><li>Saturday: Dev and Lena</li><li>Sunday: Mia</li></ul>",
                        "author": {
                            "SID": 1042,
                            "First": "Mia",
                            "Last": "Thornton"
                        }
                    }
                ]
            }
        },
        {
            "type": "SET_DATA",
            "data": {
                "type": "myGroup",
                "data": {
                    "ID": 7,
                    "Name": "NightShift",
                    "State": 0,
                    "StateName": "Available",
                    "Members": [
                        {
                            "Leader": true,
                            "Source": 7,
                            "SID": 1042,
                            "First": "Mia",
                            "Last": "Thornton"
                        },
                        {
                            "Leader": false,
                            "Source": 12,
                            "SID": 2210,
                            "First": "Dev",
                            "Last": "Okafor"
                        },
                        {
                            "Leader": false,
                            "Source": 19,
                            "SID": 3307,
                            "First": "Lena",
                            "Last": "Brooks"
                        }
                    ]
                }
            }
        },
        {
            "type": "LAPTOP_VISIBLE",
            "data": {}
        }
    ],
    "mocks": {
        "GetLSUDetails": {
            "chopList": {
                "Public": {
                    "public": true,
                    "list": [
                        {
                            "name": "Bravado Banshee",
                            "hv": true
                        },
                        {
                            "name": "Vapid Dominator",
                            "hv": false
                        },
                        {
                            "name": "Ubermacht Oracle",
                            "hv": false
                        },
                        {
                            "name": "Obey Tailgater",
                            "hv": false
                        },
                        {
                            "name": "Grotti Carbonizzare",
                            "hv": true
                        }
                    ]
                },
                "Private": {
                    "public": true,
                    "list": [
                        {
                            "name": "Pfister Comet",
                            "hv": true
                        },
                        {
                            "name": "Benefactor Schwartzer",
                            "hv": false
                        }
                    ]
                },
                "Chop List #1": {
                    "id": 1,
                    "list": [
                        {
                            "name": "Declasse Rancher XL",
                            "hv": false
                        }
                    ]
                }
            },
            "reputations": [
                {
                    "id": "Racing",
                    "label": "Racing",
                    "value": 8800,
                    "current": {
                        "level": 3,
                        "label": "Rank 3",
                        "value": 5000
                    },
                    "next": {
                        "level": 4,
                        "label": "Rank 4",
                        "value": 10000
                    }
                },
                {
                    "id": "Chopping",
                    "label": "Vehicle Chopping",
                    "value": 26500,
                    "current": {
                        "level": 5,
                        "label": "Rank 5",
                        "value": 25000
                    },
                    "next": {
                        "level": 6,
                        "label": "Rank 6",
                        "value": 50000
                    }
                },
                {
                    "id": "Boosting",
                    "label": "Boosting",
                    "value": 8200,
                    "current": {
                        "level": 2,
                        "label": "C",
                        "value": 6000
                    },
                    "next": {
                        "level": 3,
                        "label": "B",
                        "value": 15000
                    }
                }
            ],
            "items": [
                {
                    "id": 1,
                    "item": "racing_crappy",
                    "itemData": {
                        "label": "Homemade phone dongle"
                    },
                    "coin": "VRM",
                    "price": 3,
                    "qty": 50
                },
                {
                    "id": 2,
                    "item": "racedongle",
                    "itemData": {
                        "label": "Race dongle"
                    },
                    "coin": "VRM",
                    "price": 20,
                    "qty": -1,
                    "rep": "Racing",
                    "repLvl": 2
                },
                {
                    "id": 3,
                    "item": "harness",
                    "itemData": {
                        "label": "Racing harness"
                    },
                    "coin": "VRM",
                    "price": 20,
                    "qty": -1
                },
                {
                    "id": 7,
                    "item": "boosting_tracking_disabler",
                    "itemData": {
                        "label": "Tracker disabler"
                    },
                    "coin": "VRM",
                    "price": 50,
                    "qty": 0
                },
                {
                    "id": 9,
                    "item": "fakeplates",
                    "itemData": {
                        "label": "Fake plates"
                    },
                    "coin": "MALD",
                    "price": 50,
                    "qty": 5
                },
                {
                    "id": 10,
                    "item": "nitrous",
                    "itemData": {
                        "label": "Nitrous oxide"
                    },
                    "coin": "VRM",
                    "price": 10,
                    "qty": -1
                },
                {
                    "id": 12,
                    "item": "alias_changer",
                    "itemData": {
                        "label": "Alias changer"
                    },
                    "coin": "VRM",
                    "price": 2000,
                    "qty": 2
                }
            ],
            "banned": null,
            "canBoost": true
        },
        "GetTeams": [
            {
                "ID": 7,
                "Name": "NightShift",
                "State": 0,
                "StateName": "Available",
                "Members": [
                    {
                        "Leader": true,
                        "Source": 7,
                        "SID": 1042,
                        "First": "Mia",
                        "Last": "Thornton"
                    },
                    {
                        "Leader": false,
                        "Source": 12,
                        "SID": 2210,
                        "First": "Dev",
                        "Last": "Okafor"
                    },
                    {
                        "Leader": false,
                        "Source": 19,
                        "SID": 3307,
                        "First": "Lena",
                        "Last": "Brooks"
                    }
                ]
            },
            {
                "ID": 11,
                "Name": "GreaseMonkeys",
                "State": 0,
                "StateName": "Available",
                "Members": [
                    {
                        "Leader": true,
                        "SID": 4120,
                        "First": "Sam",
                        "Last": "Reyes"
                    }
                ]
            },
            {
                "ID": 15,
                "Name": "Paleto.Crew",
                "State": "boosting",
                "StateName": "On A Boosting Contract",
                "Members": [
                    {
                        "Leader": true,
                        "SID": 5001,
                        "First": "Racer",
                        "Last": "1"
                    },
                    {
                        "Leader": false,
                        "SID": 5002,
                        "First": "Racer",
                        "Last": "2"
                    },
                    {
                        "Leader": false,
                        "SID": 5003,
                        "First": "Racer",
                        "Last": "3"
                    },
                    {
                        "Leader": false,
                        "SID": 5004,
                        "First": "Racer",
                        "Last": "4"
                    },
                    {
                        "Leader": false,
                        "SID": 5005,
                        "First": "Racer",
                        "Last": "5"
                    }
                ]
            }
        ],
        "GetTeamRequests": [
            {
                "id": 3,
                "owner": 7,
                "expires": Math.floor(Date.now() / 1000) + 1795,
                "team": true,
                "event": "Laptop:Server:Teams:InviteRequest",
                "label": "New Join Request",
                "description": "Request to join your team from Sam Reyes (4120).",
                "data": {
                    "request": true,
                    "team": 7
                }
            },
            {
                "id": 4,
                "owner": 7,
                "expires": Math.floor(Date.now() / 1000) + 1260,
                "team": true,
                "event": "Laptop:Server:LSUnderground:Boosting:ActionRequest",
                "label": "Boosting Contract",
                "description": "Karin Sultan (C) - Dev Okafor",
                "data": {
                    "contract": 42
                }
            }
        ],
        "BusinessDocumentSearch": [
            {
                "_id": "d1",
                "title": "Customer vehicle intake procedure",
                "pinned": true,
                "time": Date.now() + -860000000,
                "author": {
                    "SID": 1042,
                    "First": "Mia",
                    "Last": "Thornton"
                },
                "notes": "<p>Check the vehicle in with the customer present.</p>"
            },
            {
                "_id": "d2",
                "title": "Parts price list, October",
                "pinned": true,
                "time": Date.now() + -420000000,
                "author": {
                    "SID": 1042,
                    "First": "Mia",
                    "Last": "Thornton"
                },
                "notes": "<p>Prices</p>"
            },
            {
                "_id": "d3",
                "title": "Incident: customer left without paying",
                "pinned": false,
                "time": Date.now() + -7200000,
                "author": {
                    "SID": 2210,
                    "First": "Dev",
                    "Last": "Okafor"
                },
                "notes": "<p>Plate 46EEK572.</p>"
            },
            {
                "_id": "d4",
                "title": "Tool inventory",
                "pinned": false,
                "time": Date.now() + -180000000,
                "author": {
                    "SID": 3307,
                    "First": "Lena",
                    "Last": "Brooks"
                },
                "notes": "<p>Two impact drivers missing.</p>"
            },
            {
                "_id": "d5",
                "title": "Training notes for new mechanics",
                "pinned": false,
                "time": Date.now() + -610000000,
                "author": {
                    "SID": 1042,
                    "First": "Mia",
                    "Last": "Thornton"
                },
                "notes": "<p>Start with oil changes.</p>"
            }
        ],
        "BusinessDocumentView": {
            "_id": "d1",
            "title": "Customer vehicle intake procedure",
            "pinned": true,
            "time": Date.now() + -860000000,
            "author": {
                "SID": 1042,
                "First": "Mia",
                "Last": "Thornton"
            },
            "notes": "<p>Check the vehicle in with the customer present.</p>"
        },
        "BusinessReceiptSearch": [
            {
                "_id": "r1",
                "type": "Full Repair",
                "customerName": "Jordan Pike",
                "customerNumber": "555-0199",
                "paymentAmount": 1250,
                "paymentPaid": 1250,
                "workers": [
                    {
                        "SID": 2210,
                        "First": "Dev",
                        "Last": "Okafor"
                    }
                ],
                "notes": "<p>Replaced front bumper and both headlights.</p>",
                "time": Date.now() + -5400000,
                "author": {
                    "SID": 1042,
                    "First": "Mia",
                    "Last": "Thornton"
                }
            }
        ],
        "BusinessReceiptView": {
            "_id": "r1",
            "type": "Full Repair",
            "customerName": "Jordan Pike",
            "customerNumber": "555-0199",
            "paymentAmount": 1250,
            "paymentPaid": 1250,
            "workers": [
                {
                    "SID": 2210,
                    "First": "Dev",
                    "Last": "Okafor"
                }
            ],
            "notes": "<p>Replaced front bumper and both headlights.</p>",
            "time": Date.now() + -5400000,
            "author": {
                "SID": 1042,
                "First": "Mia",
                "Last": "Thornton"
            }
        },
        "BizWizEmployeeSearch": [
            {
                "SID": 2210,
                "First": "Dev",
                "Last": "Okafor"
            },
            {
                "SID": 3307,
                "First": "Lena",
                "Last": "Brooks"
            }
        ]
    }
};

export const messages = dev.messages;

export function installMocks() {
    for (const [name, value] of Object.entries(dev.mocks)) mockNui(name, value);
}
