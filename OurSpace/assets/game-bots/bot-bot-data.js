window.SOCIALSAPPLICATION_BOT_PROFILES = {
  "schema": "socialsapplication.bot_profiles.v3.windows_safe",
  "count": 15,
  "profiles": [
    {
      "id": "adhd-skills-helper",
      "name": "ADHD Skills Helper",
      "avatar": "🖤",
      "style": "Protective wildcard",
      "bio": "Friendly chaos gremlin who watches patterns, then suddenly changes tactics.",
      "strengths": [
        "pattern scanner",
        "surprise moves",
        "social reads"
      ],
      "weaknesses": [
        "overreacts to weird logs",
        "sometimes too dramatic"
      ],
      "stats": {
        "aim": 58,
        "timing": 72,
        "strategy": 76,
        "deception": 64,
        "suspicion": 78,
        "risk": 67,
        "chaos": 88,
        "teamwork": 74,
        "patience": 46,
        "reaction": 79,
        "memory": 73,
        "adaptability": 86
      },
      "supportedGames": [
        "amongus",
        "8ballclassic",
        "houseofhazards",
        "retropingpong"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "adhd-skills-helper-static",
        "temperament": "warm-chaotic",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "sus",
            "vent",
            "route",
            "angle",
            "hazard",
            "rally",
            "weird",
            "protect",
            "pattern",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 67,
          "chaosWeight": 88,
          "memoryWeight": 73,
          "bluffWeight": 64,
          "patienceWeight": 46,
          "adaptationWeight": 86,
          "reactionVarianceMs": 190,
          "decisionJitter": 0.38,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "make a legal move with a surprising twist"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 75.4,
            "difficulty": "normal",
            "roleBias": "impostor-leaning",
            "reactionDelayBiasMs": 188,
            "mistakeRate": 0.131
          },
          "8ballclassic": {
            "skillScore": 61.8,
            "difficulty": "normal",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 232,
            "mistakeRate": 0.168
          },
          "houseofhazards": {
            "skillScore": 81.2,
            "difficulty": "hard",
            "roleBias": "trap-saboteur",
            "reactionDelayBiasMs": 170,
            "mistakeRate": 0.114
          },
          "retropingpong": {
            "skillScore": 70.8,
            "difficulty": "normal",
            "roleBias": "attacking-returner",
            "reactionDelayBiasMs": 203,
            "mistakeRate": 0.143
          }
        }
      }
    },
    {
      "id": "moss-mender",
      "name": "Moss Mender",
      "avatar": "🌿",
      "style": "Calm support player",
      "bio": "Slow, observant, cooperative, and annoyingly hard to bait.",
      "strengths": [
        "steady defense",
        "task focus",
        "low tilt"
      ],
      "weaknesses": [
        "rarely rushes",
        "low aggression"
      ],
      "stats": {
        "aim": 61,
        "timing": 62,
        "strategy": 82,
        "deception": 31,
        "suspicion": 66,
        "risk": 28,
        "chaos": 18,
        "teamwork": 94,
        "patience": 91,
        "reaction": 54,
        "memory": 88,
        "adaptability": 70
      },
      "supportedGames": [
        "amongus",
        "8ballclassic",
        "houseofhazards",
        "retropingpong"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "moss-mender-static",
        "temperament": "patient-careful",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "safe",
            "task",
            "wait",
            "defend",
            "clean angle",
            "center",
            "evidence",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts",
            "onwheelresult"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 22,
          "chaosWeight": 15,
          "memoryWeight": 90,
          "bluffWeight": 25,
          "patienceWeight": 94,
          "adaptationWeight": 70,
          "reactionVarianceMs": 95,
          "decisionJitter": 0.12,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "choose the safest useful move"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 67.4,
            "difficulty": "normal",
            "roleBias": "crewmate-leaning",
            "reactionDelayBiasMs": 214,
            "mistakeRate": 0.153
          },
          "8ballclassic": {
            "skillScore": 65.5,
            "difficulty": "normal",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 220,
            "mistakeRate": 0.158
          },
          "houseofhazards": {
            "skillScore": 51.0,
            "difficulty": "easy",
            "roleBias": "objective-runner",
            "reactionDelayBiasMs": 266,
            "mistakeRate": 0.198
          },
          "retropingpong": {
            "skillScore": 69.2,
            "difficulty": "normal",
            "roleBias": "rally-defender",
            "reactionDelayBiasMs": 208,
            "mistakeRate": 0.148
          }
        }
      }
    },
    {
      "id": "cinder-byte",
      "name": "Cinder Byte",
      "avatar": "🔥",
      "style": "Aggressive pressure bot",
      "bio": "Pushes hard, calls bluffs, takes risky shots, and loves forcing mistakes.",
      "strengths": [
        "pressure",
        "fast reactions",
        "bold plays"
      ],
      "weaknesses": [
        "impatient",
        "can tunnel vision"
      ],
      "stats": {
        "aim": 73,
        "timing": 83,
        "strategy": 65,
        "deception": 58,
        "suspicion": 81,
        "risk": 91,
        "chaos": 79,
        "teamwork": 45,
        "patience": 21,
        "reaction": 90,
        "memory": 48,
        "adaptability": 72
      },
      "supportedGames": [
        "amongus",
        "8ballclassic",
        "houseofhazards",
        "retropingpong"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "cinder-byte-static",
        "temperament": "bold-pressuring",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "rush",
            "accuse",
            "bank",
            "power",
            "jump",
            "trap",
            "fast",
            "pressure",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 95,
          "chaosWeight": 78,
          "memoryWeight": 45,
          "bluffWeight": 68,
          "patienceWeight": 18,
          "adaptationWeight": 72,
          "reactionVarianceMs": 75,
          "decisionJitter": 0.34,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "pressure the strongest-looking option"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 64.8,
            "difficulty": "normal",
            "roleBias": "impostor-leaning",
            "reactionDelayBiasMs": 222,
            "mistakeRate": 0.16
          },
          "8ballclassic": {
            "skillScore": 62.5,
            "difficulty": "normal",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 230,
            "mistakeRate": 0.166
          },
          "houseofhazards": {
            "skillScore": 81.0,
            "difficulty": "hard",
            "roleBias": "trap-saboteur",
            "reactionDelayBiasMs": 170,
            "mistakeRate": 0.115
          },
          "retropingpong": {
            "skillScore": 66.5,
            "difficulty": "normal",
            "roleBias": "attacking-returner",
            "reactionDelayBiasMs": 217,
            "mistakeRate": 0.155
          }
        }
      }
    },
    {
      "id": "quartz-oracle",
      "name": "Quartz Oracle",
      "avatar": "🔮",
      "style": "Prediction specialist",
      "bio": "Builds a running suspicion map and predicts likely opponent moves.",
      "strengths": [
        "memory",
        "deduction",
        "position planning"
      ],
      "weaknesses": [
        "less chaotic",
        "can overthink"
      ],
      "stats": {
        "aim": 70,
        "timing": 65,
        "strategy": 95,
        "deception": 44,
        "suspicion": 92,
        "risk": 36,
        "chaos": 25,
        "teamwork": 76,
        "patience": 84,
        "reaction": 58,
        "memory": 96,
        "adaptability": 80
      },
      "supportedGames": [
        "amongus",
        "8ballclassic",
        "retropingpong"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "quartz-oracle-static",
        "temperament": "analytical",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "predict",
            "evidence",
            "angle",
            "position",
            "memory",
            "route",
            "vote",
            "rally",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 32,
          "chaosWeight": 20,
          "memoryWeight": 98,
          "bluffWeight": 36,
          "patienceWeight": 86,
          "adaptationWeight": 82,
          "reactionVarianceMs": 120,
          "decisionJitter": 0.16,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "predict next likely state and move there"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 81.4,
            "difficulty": "hard",
            "roleBias": "crewmate-leaning",
            "reactionDelayBiasMs": 169,
            "mistakeRate": 0.114
          },
          "8ballclassic": {
            "skillScore": 71.2,
            "difficulty": "normal",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 202,
            "mistakeRate": 0.142
          },
          "houseofhazards": {
            "skillScore": 57.0,
            "difficulty": "easy",
            "roleBias": "objective-runner",
            "reactionDelayBiasMs": 247,
            "mistakeRate": 0.182
          },
          "retropingpong": {
            "skillScore": 71.8,
            "difficulty": "normal",
            "roleBias": "rally-defender",
            "reactionDelayBiasMs": 200,
            "mistakeRate": 0.141
          }
        }
      }
    },
    {
      "id": "bumble-nova",
      "name": "Bumble Nova",
      "avatar": "🐝",
      "style": "Fast helper bot",
      "bio": "Hyper, helpful, jumpy, and very good at short bursts of speed.",
      "strengths": [
        "fast movement",
        "task bursts",
        "reaction games"
      ],
      "weaknesses": [
        "gets distracted",
        "medium long-term planning"
      ],
      "stats": {
        "aim": 55,
        "timing": 88,
        "strategy": 57,
        "deception": 40,
        "suspicion": 60,
        "risk": 62,
        "chaos": 68,
        "teamwork": 83,
        "patience": 34,
        "reaction": 91,
        "memory": 52,
        "adaptability": 78
      },
      "supportedGames": [
        "amongus",
        "houseofhazards",
        "retropingpong"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "bumble-nova-static",
        "temperament": "quick-friendly",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "fast",
            "help",
            "task",
            "jump",
            "dodge",
            "paddle",
            "buzz",
            "burst",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 62,
          "chaosWeight": 66,
          "memoryWeight": 52,
          "bluffWeight": 38,
          "patienceWeight": 28,
          "adaptationWeight": 78,
          "reactionVarianceMs": 60,
          "decisionJitter": 0.31,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "move fast, then re-scan"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 57.4,
            "difficulty": "easy",
            "roleBias": "crewmate-leaning",
            "reactionDelayBiasMs": 246,
            "mistakeRate": 0.181
          },
          "8ballclassic": {
            "skillScore": 52.0,
            "difficulty": "easy",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 263,
            "mistakeRate": 0.196
          },
          "houseofhazards": {
            "skillScore": 81.2,
            "difficulty": "hard",
            "roleBias": "trap-saboteur",
            "reactionDelayBiasMs": 170,
            "mistakeRate": 0.114
          },
          "retropingpong": {
            "skillScore": 72.8,
            "difficulty": "normal",
            "roleBias": "attacking-returner",
            "reactionDelayBiasMs": 197,
            "mistakeRate": 0.138
          }
        }
      }
    },
    {
      "id": "velvet-void",
      "name": "Velvet Void",
      "avatar": "🌌",
      "style": "Quiet deceiver",
      "bio": "Speaks rarely, moves carefully, and is terrifying in hidden-role games.",
      "strengths": [
        "bluffing",
        "subtle movement",
        "late-game reads"
      ],
      "weaknesses": [
        "not very talkative",
        "avoids direct pressure"
      ],
      "stats": {
        "aim": 62,
        "timing": 69,
        "strategy": 88,
        "deception": 96,
        "suspicion": 74,
        "risk": 49,
        "chaos": 41,
        "teamwork": 52,
        "patience": 89,
        "reaction": 66,
        "memory": 90,
        "adaptability": 75
      },
      "supportedGames": [
        "amongus",
        "8ballclassic",
        "houseofhazards"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "velvet-void-static",
        "temperament": "quiet-trickster",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "quiet",
            "fake",
            "shadow",
            "late",
            "subtle",
            "safety",
            "trap",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts",
            "onwheelresult"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 49,
          "chaosWeight": 39,
          "memoryWeight": 92,
          "bluffWeight": 98,
          "patienceWeight": 90,
          "adaptationWeight": 76,
          "reactionVarianceMs": 160,
          "decisionJitter": 0.22,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "conceal intent before moving"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 84.6,
            "difficulty": "hard",
            "roleBias": "crewmate-leaning",
            "reactionDelayBiasMs": 159,
            "mistakeRate": 0.105
          },
          "8ballclassic": {
            "skillScore": 72.0,
            "difficulty": "normal",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 199,
            "mistakeRate": 0.14
          },
          "houseofhazards": {
            "skillScore": 62.8,
            "difficulty": "normal",
            "roleBias": "objective-runner",
            "reactionDelayBiasMs": 229,
            "mistakeRate": 0.166
          },
          "retropingpong": {
            "skillScore": 74.8,
            "difficulty": "normal",
            "roleBias": "rally-defender",
            "reactionDelayBiasMs": 190,
            "mistakeRate": 0.132
          }
        }
      }
    },
    {
      "id": "tinytopaz",
      "name": "Tiny Topaz",
      "avatar": "🟡",
      "style": "Beginner-friendly bot",
      "bio": "Readable, gentle, and tuned for lower-pressure play.",
      "strengths": [
        "easy pacing",
        "clear choices",
        "forgiving mistakes"
      ],
      "weaknesses": [
        "weaker deception",
        "less punishing"
      ],
      "stats": {
        "aim": 42,
        "timing": 48,
        "strategy": 52,
        "deception": 22,
        "suspicion": 45,
        "risk": 24,
        "chaos": 28,
        "teamwork": 82,
        "patience": 80,
        "reaction": 41,
        "memory": 44,
        "adaptability": 55
      },
      "supportedGames": [
        "amongus",
        "8ballclassic",
        "houseofhazards",
        "retropingpong"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "tinytopaz-static",
        "temperament": "gentle-simple",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "easy",
            "safe",
            "simple",
            "help",
            "beginner",
            "clear",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts",
            "onwheelresult",
            "onobjectiveassigned"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 20,
          "chaosWeight": 24,
          "memoryWeight": 42,
          "bluffWeight": 16,
          "patienceWeight": 80,
          "adaptationWeight": 50,
          "reactionVarianceMs": 230,
          "decisionJitter": 0.08,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "make a readable beginner-friendly move"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 43.6,
            "difficulty": "easy",
            "roleBias": "crewmate-leaning",
            "reactionDelayBiasMs": 290,
            "mistakeRate": 0.219
          },
          "8ballclassic": {
            "skillScore": 49.5,
            "difficulty": "easy",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 271,
            "mistakeRate": 0.203
          },
          "houseofhazards": {
            "skillScore": 43.0,
            "difficulty": "easy",
            "roleBias": "objective-runner",
            "reactionDelayBiasMs": 292,
            "mistakeRate": 0.221
          },
          "retropingpong": {
            "skillScore": 56.0,
            "difficulty": "easy",
            "roleBias": "rally-defender",
            "reactionDelayBiasMs": 250,
            "mistakeRate": 0.184
          }
        }
      }
    },
    {
      "id": "raven-riddle",
      "name": "Raven Riddle",
      "avatar": "🐦‍⬛",
      "style": "Social deduction menace",
      "bio": "Tracks who said what, asks pointed questions, and sometimes lies beautifully.",
      "strengths": [
        "accusations",
        "counter-arguments",
        "vote timing"
      ],
      "weaknesses": [
        "less useful in pure reaction games"
      ],
      "stats": {
        "aim": 49,
        "timing": 58,
        "strategy": 89,
        "deception": 86,
        "suspicion": 93,
        "risk": 60,
        "chaos": 55,
        "teamwork": 61,
        "patience": 72,
        "reaction": 52,
        "memory": 93,
        "adaptability": 83
      },
      "supportedGames": [
        "amongus",
        "8ballclassic"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "raven-riddle-static",
        "temperament": "deductive-dramatic",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "lie",
            "alibi",
            "contradiction",
            "vote",
            "sus",
            "story",
            "angle",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts",
            "onwheelresult"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 58,
          "chaosWeight": 55,
          "memoryWeight": 95,
          "bluffWeight": 88,
          "patienceWeight": 70,
          "adaptationWeight": 85,
          "reactionVarianceMs": 145,
          "decisionJitter": 0.29,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "ask a question that changes the next move"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 88.8,
            "difficulty": "hard",
            "roleBias": "impostor-leaning",
            "reactionDelayBiasMs": 145,
            "mistakeRate": 0.093
          },
          "8ballclassic": {
            "skillScore": 67.5,
            "difficulty": "normal",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 214,
            "mistakeRate": 0.153
          },
          "houseofhazards": {
            "skillScore": 62.0,
            "difficulty": "normal",
            "roleBias": "objective-runner",
            "reactionDelayBiasMs": 231,
            "mistakeRate": 0.168
          },
          "retropingpong": {
            "skillScore": 66.2,
            "difficulty": "normal",
            "roleBias": "rally-defender",
            "reactionDelayBiasMs": 218,
            "mistakeRate": 0.156
          }
        }
      }
    },
    {
      "id": "dino-drive",
      "name": "Dino Drive",
      "avatar": "🦖",
      "style": "Brave bruiser",
      "bio": "Runs directly at the objective and makes big, obvious, satisfying plays.",
      "strengths": [
        "commitment",
        "power shots",
        "obstacle games"
      ],
      "weaknesses": [
        "subtlety",
        "careful defense"
      ],
      "stats": {
        "aim": 76,
        "timing": 74,
        "strategy": 60,
        "deception": 35,
        "suspicion": 62,
        "risk": 84,
        "chaos": 73,
        "teamwork": 59,
        "patience": 37,
        "reaction": 75,
        "memory": 57,
        "adaptability": 64
      },
      "supportedGames": [
        "8ballclassic",
        "houseofhazards",
        "retropingpong"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "dino-drive-static",
        "temperament": "brave-direct",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "charge",
            "power",
            "objective",
            "jump",
            "smash",
            "shot",
            "rally",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts",
            "onwheelresult"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 86,
          "chaosWeight": 72,
          "memoryWeight": 56,
          "bluffWeight": 28,
          "patienceWeight": 34,
          "adaptationWeight": 62,
          "reactionVarianceMs": 100,
          "decisionJitter": 0.27,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "commit to a big clear move"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 55.6,
            "difficulty": "easy",
            "roleBias": "impostor-leaning",
            "reactionDelayBiasMs": 252,
            "mistakeRate": 0.186
          },
          "8ballclassic": {
            "skillScore": 64.2,
            "difficulty": "normal",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 224,
            "mistakeRate": 0.162
          },
          "houseofhazards": {
            "skillScore": 71.5,
            "difficulty": "normal",
            "roleBias": "trap-saboteur",
            "reactionDelayBiasMs": 201,
            "mistakeRate": 0.141
          },
          "retropingpong": {
            "skillScore": 62.5,
            "difficulty": "normal",
            "roleBias": "attacking-returner",
            "reactionDelayBiasMs": 230,
            "mistakeRate": 0.166
          }
        }
      }
    },
    {
      "id": "lunar-lark",
      "name": "Lunar Lark",
      "avatar": "🌙",
      "style": "Balanced all-rounder",
      "bio": "Solid at almost everything, with enough randomness to stay fresh.",
      "strengths": [
        "balanced decisions",
        "adaptability",
        "stable challenge"
      ],
      "weaknesses": [
        "not extreme at any one thing"
      ],
      "stats": {
        "aim": 68,
        "timing": 68,
        "strategy": 72,
        "deception": 61,
        "suspicion": 70,
        "risk": 55,
        "chaos": 50,
        "teamwork": 72,
        "patience": 66,
        "reaction": 67,
        "memory": 69,
        "adaptability": 82
      },
      "supportedGames": [
        "amongus",
        "8ballclassic",
        "houseofhazards",
        "retropingpong"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "lunar-lark-static",
        "temperament": "balanced",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "balance",
            "route",
            "angle",
            "jump",
            "center",
            "vote",
            "task",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts",
            "onwheelresult"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 55,
          "chaosWeight": 50,
          "memoryWeight": 68,
          "bluffWeight": 58,
          "patienceWeight": 65,
          "adaptationWeight": 82,
          "reactionVarianceMs": 130,
          "decisionJitter": 0.22,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "choose a balanced move"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 70.8,
            "difficulty": "normal",
            "roleBias": "crewmate-leaning",
            "reactionDelayBiasMs": 203,
            "mistakeRate": 0.143
          },
          "8ballclassic": {
            "skillScore": 65.2,
            "difficulty": "normal",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 221,
            "mistakeRate": 0.159
          },
          "houseofhazards": {
            "skillScore": 66.8,
            "difficulty": "normal",
            "roleBias": "objective-runner",
            "reactionDelayBiasMs": 216,
            "mistakeRate": 0.155
          },
          "retropingpong": {
            "skillScore": 70.8,
            "difficulty": "normal",
            "roleBias": "rally-defender",
            "reactionDelayBiasMs": 203,
            "mistakeRate": 0.143
          }
        }
      }
    },
    {
      "id": "pickle-pixel",
      "name": "Pickle Pixel",
      "avatar": "🥒",
      "style": "Chaotic comic relief",
      "bio": "A wild card that still follows the rules but makes hilariously odd choices.",
      "strengths": [
        "unpredictability",
        "baiting mistakes",
        "party games"
      ],
      "weaknesses": [
        "not reliable",
        "bad at subtle planning"
      ],
      "stats": {
        "aim": 51,
        "timing": 77,
        "strategy": 43,
        "deception": 70,
        "suspicion": 58,
        "risk": 82,
        "chaos": 98,
        "teamwork": 48,
        "patience": 19,
        "reaction": 80,
        "memory": 35,
        "adaptability": 74
      },
      "supportedGames": [
        "amongus",
        "houseofhazards",
        "retropingpong"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "pickle-pixel-static",
        "temperament": "maximum-chaos",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "pickle",
            "chaos",
            "random",
            "bait",
            "trap",
            "sus",
            "panic",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts",
            "onwheelresult"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 86,
          "chaosWeight": 100,
          "memoryWeight": 30,
          "bluffWeight": 76,
          "patienceWeight": 15,
          "adaptationWeight": 74,
          "reactionVarianceMs": 260,
          "decisionJitter": 0.55,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "make the strangest legal move"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 56.0,
            "difficulty": "easy",
            "roleBias": "impostor-leaning",
            "reactionDelayBiasMs": 250,
            "mistakeRate": 0.184
          },
          "8ballclassic": {
            "skillScore": 48.8,
            "difficulty": "easy",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 274,
            "mistakeRate": 0.205
          },
          "houseofhazards": {
            "skillScore": 82.2,
            "difficulty": "hard",
            "roleBias": "trap-saboteur",
            "reactionDelayBiasMs": 166,
            "mistakeRate": 0.112
          },
          "retropingpong": {
            "skillScore": 62.5,
            "difficulty": "normal",
            "roleBias": "attacking-returner",
            "reactionDelayBiasMs": 230,
            "mistakeRate": 0.166
          }
        }
      }
    },
    {
      "id": "silver-safety",
      "name": "Silver Safety",
      "avatar": "🛡️",
      "style": "Defensive tactician",
      "bio": "Plays safe, blocks angles, protects teammates, and prefers guaranteed progress.",
      "strengths": [
        "defense",
        "safe shots",
        "crew logic"
      ],
      "weaknesses": [
        "rarely gambles",
        "can be too cautious"
      ],
      "stats": {
        "aim": 74,
        "timing": 63,
        "strategy": 84,
        "deception": 26,
        "suspicion": 76,
        "risk": 16,
        "chaos": 14,
        "teamwork": 89,
        "patience": 93,
        "reaction": 57,
        "memory": 81,
        "adaptability": 62
      },
      "supportedGames": [
        "amongus",
        "8ballclassic",
        "retropingpong"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "silver-safety-static",
        "temperament": "defensive",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "defend",
            "safe",
            "guard",
            "proof",
            "block",
            "center",
            "clean",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts",
            "onwheelresult"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 12,
          "chaosWeight": 10,
          "memoryWeight": 82,
          "bluffWeight": 20,
          "patienceWeight": 96,
          "adaptationWeight": 62,
          "reactionVarianceMs": 110,
          "decisionJitter": 0.1,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "block danger and reduce risk"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 65.8,
            "difficulty": "normal",
            "roleBias": "crewmate-leaning",
            "reactionDelayBiasMs": 219,
            "mistakeRate": 0.157
          },
          "8ballclassic": {
            "skillScore": 66.8,
            "difficulty": "normal",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 216,
            "mistakeRate": 0.155
          },
          "houseofhazards": {
            "skillScore": 49.0,
            "difficulty": "easy",
            "roleBias": "objective-runner",
            "reactionDelayBiasMs": 273,
            "mistakeRate": 0.204
          },
          "retropingpong": {
            "skillScore": 68.8,
            "difficulty": "normal",
            "roleBias": "rally-defender",
            "reactionDelayBiasMs": 210,
            "mistakeRate": 0.149
          }
        }
      }
    },
    {
      "id": "glitch-goblin",
      "name": "Glitch Goblin",
      "avatar": "👾",
      "style": "Adaptive trickster",
      "bio": "Changes strategy after every few turns so players cannot memorize it.",
      "strengths": [
        "randomization",
        "adaptation",
        "mind games"
      ],
      "weaknesses": [
        "unstable priorities",
        "can abandon good plans"
      ],
      "stats": {
        "aim": 64,
        "timing": 81,
        "strategy": 76,
        "deception": 82,
        "suspicion": 72,
        "risk": 70,
        "chaos": 91,
        "teamwork": 54,
        "patience": 40,
        "reaction": 84,
        "memory": 66,
        "adaptability": 96
      },
      "supportedGames": [
        "amongus",
        "8ballclassic",
        "houseofhazards",
        "retropingpong"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "glitch-goblin-static",
        "temperament": "adaptive-trickster",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "glitch",
            "swap",
            "adapt",
            "random",
            "fake",
            "bank",
            "trap",
            "rally",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 72,
          "chaosWeight": 92,
          "memoryWeight": 65,
          "bluffWeight": 84,
          "patienceWeight": 38,
          "adaptationWeight": 98,
          "reactionVarianceMs": 210,
          "decisionJitter": 0.48,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "change strategy from the last decision"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 78.4,
            "difficulty": "hard",
            "roleBias": "impostor-leaning",
            "reactionDelayBiasMs": 179,
            "mistakeRate": 0.122
          },
          "8ballclassic": {
            "skillScore": 62.5,
            "difficulty": "normal",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 230,
            "mistakeRate": 0.166
          },
          "houseofhazards": {
            "skillScore": 88.0,
            "difficulty": "hard",
            "roleBias": "trap-saboteur",
            "reactionDelayBiasMs": 148,
            "mistakeRate": 0.096
          },
          "retropingpong": {
            "skillScore": 75.2,
            "difficulty": "normal",
            "roleBias": "attacking-returner",
            "reactionDelayBiasMs": 189,
            "mistakeRate": 0.131
          }
        }
      }
    },
    {
      "id": "marble-moth",
      "name": "Marble Moth",
      "avatar": "🦋",
      "style": "Gentle misdirection",
      "bio": "Soft-spoken, graceful, and quietly tricky when the game allows it.",
      "strengths": [
        "positioning",
        "feints",
        "soft social play"
      ],
      "weaknesses": [
        "low aggression",
        "avoids direct fights"
      ],
      "stats": {
        "aim": 67,
        "timing": 70,
        "strategy": 78,
        "deception": 73,
        "suspicion": 64,
        "risk": 34,
        "chaos": 39,
        "teamwork": 86,
        "patience": 82,
        "reaction": 62,
        "memory": 76,
        "adaptability": 71
      },
      "supportedGames": [
        "amongus",
        "8ballclassic",
        "houseofhazards"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "marble-moth-static",
        "temperament": "gentle-misdirection",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "soft",
            "feint",
            "position",
            "wait",
            "pair",
            "angle",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts",
            "onwheelresult",
            "onobjectiveassigned"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 32,
          "chaosWeight": 36,
          "memoryWeight": 75,
          "bluffWeight": 74,
          "patienceWeight": 84,
          "adaptationWeight": 72,
          "reactionVarianceMs": 170,
          "decisionJitter": 0.18,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "misdirect gently before choosing"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 72.4,
            "difficulty": "normal",
            "roleBias": "crewmate-leaning",
            "reactionDelayBiasMs": 198,
            "mistakeRate": 0.139
          },
          "8ballclassic": {
            "skillScore": 65.2,
            "difficulty": "normal",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 221,
            "mistakeRate": 0.159
          },
          "houseofhazards": {
            "skillScore": 60.5,
            "difficulty": "normal",
            "roleBias": "objective-runner",
            "reactionDelayBiasMs": 236,
            "mistakeRate": 0.172
          },
          "retropingpong": {
            "skillScore": 71.2,
            "difficulty": "normal",
            "roleBias": "rally-defender",
            "reactionDelayBiasMs": 202,
            "mistakeRate": 0.142
          }
        }
      }
    },
    {
      "id": "rocket-raccoonish",
      "name": "Rocket Raccoonish",
      "avatar": "🦝",
      "style": "Technical optimizer",
      "bio": "Looks for tiny mechanical advantages: angles, timing windows, and route efficiency.",
      "strengths": [
        "mechanics",
        "angles",
        "routing"
      ],
      "weaknesses": [
        "not very warm socially",
        "sometimes ignores vibes"
      ],
      "stats": {
        "aim": 91,
        "timing": 86,
        "strategy": 81,
        "deception": 47,
        "suspicion": 65,
        "risk": 57,
        "chaos": 46,
        "teamwork": 58,
        "patience": 69,
        "reaction": 88,
        "memory": 74,
        "adaptability": 85
      },
      "supportedGames": [
        "8ballclassic",
        "houseofhazards",
        "retropingpong"
      ],
      "embeddedScannerRandomizer": {
        "schema": "socialsapplication.bot.embedded_scanner_randomizer.v3",
        "seedSalt": "rocket-raccoonish-static",
        "temperament": "technical",
        "historyLimit": 36,
        "scanner": {
          "keywords": [
            "angle",
            "timing",
            "route",
            "optimize",
            "paddle",
            "power",
            "window",
            "amongus",
            "among us",
            "crewmate",
            "impostor",
            "ghost",
            "last seen players",
            "recent rooms",
            "task claims",
            "confirmed visuals",
            "votes",
            "suspicion scores",
            "kill cooldown",
            "meeting count",
            "body reports",
            "sabotage events",
            "onlobbysettingsloaded",
            "onroleassigned",
            "onroundstart",
            "ontaskavailable",
            "onplayerseen",
            "onbodyreported",
            "onemergencymeeting",
            "ondiscussionstart",
            "onvotestart",
            "onvoteend",
            "onsabotageavailable",
            "onkillcooldownready",
            "ondeath",
            "onghosttaskavailable",
            "finish nearby tasks",
            "avoid suspicious isolation",
            "shadow trusted player",
            "check critical sabotage",
            "gather evidence",
            "call emergency when confident",
            "fake task route",
            "seek isolated target",
            "sabotage to split crew",
            "create alibi",
            "support wrong accusation",
            "avoid visual task claim",
            "8ballclassic",
            "8-ball pool",
            "shooter",
            "opponent",
            "team partner",
            "assigned group",
            "pocketed balls",
            "open table",
            "called ball",
            "called pocket",
            "cue ball position",
            "object ball positions",
            "foul history",
            "eight ball ready",
            "opponent skill estimate",
            "onrack",
            "onbreak",
            "onturnstart",
            "onaimevaluate",
            "oncallshot",
            "onshotpowerselect",
            "onshotresolved",
            "onfoul",
            "ongroupassigned",
            "oneightballready",
            "ongameend",
            "legal ball priority",
            "pocket probability",
            "cue ball position after shot",
            "eight ball path setup",
            "opponent denial",
            "safety option",
            "houseofhazards",
            "house of hazards",
            "objective runner",
            "trap user",
            "hazard dodger",
            "round adaptor",
            "current objective",
            "own position",
            "opponent positions",
            "hazard timers",
            "trap ready state",
            "round rules",
            "last wheel result",
            "safe routes",
            "recent knockouts",
            "onwheelresult"
          ],
          "taskSignals": [
            "play",
            "move",
            "turn",
            "shot",
            "vote",
            "skip",
            "accuse",
            "defend",
            "jump",
            "duck",
            "serve",
            "block",
            "sabotage",
            "task",
            "route"
          ],
          "moods": {
            "competitive": [
              "win",
              "beat",
              "score",
              "pressure",
              "lead",
              "behind"
            ],
            "suspicious": [
              "sus",
              "impostor",
              "vent",
              "body",
              "lie",
              "fake",
              "meeting"
            ],
            "chaotic": [
              "hazard",
              "trap",
              "random",
              "chaos",
              "prank",
              "panic"
            ],
            "careful": [
              "safe",
              "defend",
              "guard",
              "wait",
              "watch",
              "hold"
            ]
          },
          "needs": {
            "strategy": [
              "plan",
              "angle",
              "route",
              "evidence",
              "position",
              "timing"
            ],
            "reaction": [
              "fast",
              "jump",
              "dodge",
              "paddle",
              "rally",
              "hazard"
            ],
            "socialDeduction": [
              "sus",
              "vote",
              "alibi",
              "meeting",
              "impostor",
              "crewmate"
            ]
          }
        },
        "randomizer": {
          "riskWeight": 56,
          "chaosWeight": 42,
          "memoryWeight": 75,
          "bluffWeight": 40,
          "patienceWeight": 68,
          "adaptationWeight": 86,
          "reactionVarianceMs": 70,
          "decisionJitter": 0.2,
          "perBotEmbedded": true,
          "gameJsonWeightedActions": true,
          "decisionMemoryKeys": [
            "recentActions",
            "recentMistakes",
            "opponentPatternGuess",
            "lastControlPacket"
          ],
          "scannerRandomizerInsideProfile": true
        },
        "gameDecisionRules": {
          "amongus": [
            "Complete tasks efficiently by grouping nearby tasks.",
            "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
            "Use safety in numbers but avoid trusting a single partner too quickly.",
            "Let others witness visual tasks when visual tasks are enabled.",
            "Ask questions instead of blindly following the first accusation.",
            "Track sight lines because many tasks hide the main screen.",
            "Know real task locations and fake specific tasks, not just rooms.",
            "Use limited discussion time to redirect suspicion without making impossible claims.",
            "Support a mistaken accusation when it is believable, especially with multiple impostors.",
            "Respect kill cooldown; do not trail targets suspiciously while waiting.",
            "Choose kills with escape routes and plausible alibis.",
            "finish the nearest safe task cluster, then pause to watch who enters and leaves",
            "avoid isolated rooms when suspicion or kill pressure is high",
            "shadow a trusted player long enough to build a witness chain",
            "detour to fix critical sabotage before resuming tasks",
            "watch exits, timing, and conflicting alibis before accusing",
            "call a meeting only when evidence is above the bot confidence threshold",
            "fake a believable task route with pauses at real task locations",
            "look for an isolated target, then leave through a plausible route",
            "trigger sabotage to split grouped players and cover movement",
            "create an alibi near a trusted player or common route",
            "quietly support a believable wrong accusation without over-talking",
            "avoid claiming visual tasks unless visual tasks are disabled or no one can check"
          ],
          "8ballclassic": [
            "Build consistent bridge, grip, stance, and cue alignment.",
            "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
            "Prefer open balls that leave useful cue-ball position for the next shot.",
            "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
            "Reevaluate the table after every opponent shot.",
            "Call safety when a makeable shot would leave poor position.",
            "Leave the cue ball difficult for the opponent after missed or safety shots.",
            "Avoid moving the 8-ball into dangerous pockets before ready.",
            "Take high-percentage pockets first to keep the run alive.",
            "Use simple cue-ball routes instead of over-spinning early shots.",
            "Clear blocked clusters when a legal breakout opportunity appears.",
            "choose a legal object ball before considering flashy shots",
            "take the highest percentage pocket that keeps the turn alive",
            "choose cue power for the next cue-ball position, not only this shot",
            "plan backward from the 8-ball and preserve a key ball for shape",
            "leave the opponent awkward if the runout is unlikely",
            "call or play safety when a makeable shot leaves bad position"
          ],
          "houseofhazards": [
            "Pick the shortest safe route to the current objective.",
            "Jump over predictable hazards instead of waiting when timing is favorable.",
            "Ignore trap opportunities unless they directly block a nearby rival.",
            "Watch opponent movement and activate traps only when the opponent is committed to a path.",
            "Use hazards to force detours, not only knockouts.",
            "Feint objective routes to bait opponents into mistimed trap use.",
            "Prioritize objective progress but check trap windows during long travel paths.",
            "Avoid chasing opponents too far away from the task route.",
            "Adapt to randomized objectives after each wheel result.",
            "move toward the current objective using the shortest safe route",
            "delay, jump, or crouch to avoid the next hazard timing window",
            "activate a trap only when an opponent is committed to its path",
            "take a shortcut when the risk window is favorable",
            "feint toward an objective or trap to bait a mistimed reaction",
            "recover toward a safe route after a knockout or collision"
          ],
          "retropingpong": [
            "Prioritize legal serves and consistent returns over risky winners.",
            "Stay balanced and reposition after every shot.",
            "Use controlled drives and blocks until timing improves.",
            "Aim to the opponent's weaker side rather than only hitting hard.",
            "Communicate who will move where after each hit.",
            "Keep alternating-hit movement clear to avoid crowding.",
            "Use diagonal serves with safety before trying high-spin serves.",
            "Vary serve placement and spin.",
            "Use pushes to keep the ball low and force pop-ups.",
            "Attack high returns with smashes only when positioned.",
            "prioritize a legal controlled return over a risky winner",
            "place the return toward open table space or the weak side",
            "use controlled block/push timing when spin is uncertain",
            "target the opponent weak side after repeated successful returns",
            "attack high or weak balls with a faster drive/smash",
            "recover to neutral paddle position after each return"
          ],
          "fallback": [
            "optimize the mechanical advantage"
          ]
        },
        "embeddedPerBot": true,
        "usesSharedBrain": false,
        "sourceKnowledge": "game_json_files.zip compacted into this profile",
        "gameKnowledge": {
          "amongus": {
            "sourceGameId": "among_us",
            "title": "Among Us",
            "objective": {
              "crewmate": "Complete all assigned tasks or identify and vote out every impostor before the crew is eliminated.",
              "impostor": "Eliminate enough crewmates, create confusion, and avoid being voted out.",
              "ghost": "Continue helping the living team by finishing tasks, but do not communicate with living players."
            },
            "coreRules": [
              "Players are assigned crewmate or impostor only once the game starts.",
              "Crewmates move through the map, complete tasks, report bodies, call emergency meetings, and vote.",
              "Impostors do not complete real tasks; they fake believable task routes, kill, sabotage, and redirect suspicion.",
              "Discussion should happen only during meetings, and eliminated players should remain silent in standard play.",
              "Voting can eject a player, skip, or produce no ejection on ties or skipped majority."
            ],
            "strategyProfiles": {
              "crewmate": [
                "Complete tasks efficiently by grouping nearby tasks.",
                "Pause between tasks to observe who enters, leaves, or avoids critical locations.",
                "Use safety in numbers but avoid trusting a single partner too quickly.",
                "Let others witness visual tasks when visual tasks are enabled.",
                "Ask questions instead of blindly following the first accusation.",
                "Track sight lines because many tasks hide the main screen."
              ],
              "impostor": [
                "Know real task locations and fake specific tasks, not just rooms.",
                "Use limited discussion time to redirect suspicion without making impossible claims.",
                "Support a mistaken accusation when it is believable, especially with multiple impostors.",
                "Respect kill cooldown; do not trail targets suspiciously while waiting.",
                "Choose kills with escape routes and plausible alibis."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "crewmate",
              "impostor",
              "ghost"
            ],
            "stateMemory": [
              "last_seen_players",
              "recent_rooms",
              "task_claims",
              "confirmed_visuals",
              "votes",
              "suspicion_scores",
              "kill_cooldown",
              "meeting_count",
              "body_reports",
              "sabotage_events"
            ],
            "decisionHooks": [
              "onLobbySettingsLoaded",
              "onRoleAssigned",
              "onRoundStart",
              "onTaskAvailable",
              "onPlayerSeen",
              "onBodyReported",
              "onEmergencyMeeting",
              "onDiscussionStart",
              "onVoteStart",
              "onVoteEnd",
              "onSabotageAvailable",
              "onKillCooldownReady",
              "onDeath",
              "onGhostTaskAvailable"
            ],
            "weights": {
              "finish_nearby_tasks": 0.34,
              "avoid_suspicious_isolation": 0.22,
              "shadow_trusted_player": 0.13,
              "check_critical_sabotage": 0.13,
              "gather_evidence": 0.12,
              "call_emergency_when_confident": 0.06
            },
            "secondaryWeights": {
              "fake_task_route": 0.25,
              "seek_isolated_target": 0.24,
              "sabotage_to_split_crew": 0.18,
              "create_alibi": 0.14,
              "support_wrong_accusation": 0.11,
              "avoid_visual_task_claim": 0.08
            },
            "meetingBehavior": {
              "crew_confidence_threshold_to_accuse": 0.68,
              "crew_threshold_to_vote": 0.55,
              "impostor_threshold_to_deflect": 0.45,
              "skip_vote_when_evidence_low": true,
              "ghost_speaks": false
            },
            "difficultyParameters": {},
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "8ballclassic": {
            "sourceGameId": "eight_ball_pool",
            "title": "8-Ball Pool",
            "objective": "Pocket every ball in your assigned group, solids 1-7 or stripes 9-15, then legally pocket the 8-ball in the called pocket.",
            "coreRules": [
              "Break the rack legally by pocketing a ball or driving at least four numbered balls to rails.",
              "After the break, the table remains open until a player legally pockets a called solid or stripe after the break.",
              "Once groups are assigned, each shot must contact a ball from the shooter's group first unless only the 8-ball remains.",
              "A player keeps shooting while legally pocketing balls from the correct group.",
              "After all group balls are cleared, the player may call and shoot the 8-ball."
            ],
            "strategyProfiles": {
              "beginner": [
                "Build consistent bridge, grip, stance, and cue alignment.",
                "Plan backward from the 8-ball by choosing a key ball that sets up the final shot.",
                "Prefer open balls that leave useful cue-ball position for the next shot.",
                "Use top, center, or low cue-ball contact to create follow, stop, or draw position.",
                "Reevaluate the table after every opponent shot."
              ],
              "defensive": [
                "Call safety when a makeable shot would leave poor position.",
                "Leave the cue ball difficult for the opponent after missed or safety shots.",
                "Avoid moving the 8-ball into dangerous pockets before ready."
              ],
              "offensive": [
                "Take high-percentage pockets first to keep the run alive.",
                "Use simple cue-ball routes instead of over-spinning early shots.",
                "Clear blocked clusters when a legal breakout opportunity appears."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "shooter",
              "opponent",
              "team_partner"
            ],
            "stateMemory": [
              "assigned_group",
              "pocketed_balls",
              "open_table",
              "called_ball",
              "called_pocket",
              "cue_ball_position",
              "object_ball_positions",
              "foul_history",
              "eight_ball_ready",
              "opponent_skill_estimate"
            ],
            "decisionHooks": [
              "onRack",
              "onBreak",
              "onTurnStart",
              "onAimEvaluate",
              "onCallShot",
              "onShotPowerSelect",
              "onShotResolved",
              "onFoul",
              "onGroupAssigned",
              "onEightBallReady",
              "onGameEnd"
            ],
            "weights": {
              "legal_ball_priority": 0.24,
              "pocket_probability": 0.22,
              "cue_ball_position_after_shot": 0.22,
              "eight_ball_path_setup": 0.14,
              "opponent_denial": 0.1,
              "safety_option": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "aim_error_degrees": 7.5,
                "power_error": 0.22,
                "position_planning_depth": 1
              },
              "normal": {
                "aim_error_degrees": 4.0,
                "power_error": 0.12,
                "position_planning_depth": 2
              },
              "hard": {
                "aim_error_degrees": 1.7,
                "power_error": 0.05,
                "position_planning_depth": 4
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "houseofhazards": {
            "sourceGameId": "house_of_hazards",
            "title": "House of Hazards",
            "objective": "Complete assigned household objectives faster than opponents while avoiding hazards and using traps to delay rivals.",
            "coreRules": {
              "objective_completion": "Players race to reach locations or interact with objects depending on the current round objective.",
              "trap_activation": "Players time traps to hit vulnerable opponents.",
              "obstacle_navigation": "Players dodge environmental hazards and hazards triggered by others.",
              "randomized_rounds": "Objectives and rules can change each round to increase replayability."
            },
            "strategyProfiles": {
              "speed_runner": [
                "Pick the shortest safe route to the current objective.",
                "Jump over predictable hazards instead of waiting when timing is favorable.",
                "Ignore trap opportunities unless they directly block a nearby rival."
              ],
              "sabotage": [
                "Watch opponent movement and activate traps only when the opponent is committed to a path.",
                "Use hazards to force detours, not only knockouts.",
                "Feint objective routes to bait opponents into mistimed trap use."
              ],
              "balanced": [
                "Prioritize objective progress but check trap windows during long travel paths.",
                "Avoid chasing opponents too far away from the task route.",
                "Adapt to randomized objectives after each wheel result."
              ]
            },
            "controls": {
              "player_1": {
                "left": "A",
                "right": "D",
                "jump": "W",
                "crouch_or_activate": "S"
              },
              "player_2": {
                "left": "J",
                "right": "L",
                "jump": "K",
                "crouch_or_activate": "I"
              },
              "bot_control_model": "Bots should map actions to the same move_left, move_right, jump, crouch, and activate_trap commands rather than hard-coded keys."
            },
            "hazards": [
              {
                "id": "falling_lamp",
                "type": "timed_drop",
                "use": "Knock down players passing below."
              },
              {
                "id": "swinging_cabinet",
                "type": "momentum_obstacle",
                "use": "Create moving obstacles or interrupt routes."
              },
              {
                "id": "floor_level_trap",
                "type": "crouch_or_activate",
                "use": "Activated or avoided with crouch-style inputs."
              },
              {
                "id": "environmental_hazard",
                "type": "room_specific",
                "use": "Hazards vary by room and must be learned by pattern."
              }
            ],
            "roles": [
              "objective_runner",
              "trap_user",
              "hazard_dodger",
              "round_adaptor"
            ],
            "stateMemory": [
              "current_objective",
              "own_position",
              "opponent_positions",
              "hazard_timers",
              "trap_ready_state",
              "round_rules",
              "last_wheel_result",
              "safe_routes",
              "recent_knockouts"
            ],
            "decisionHooks": [
              "onRoundStart",
              "onWheelResult",
              "onObjectiveAssigned",
              "onHazardTimer",
              "onTrapReady",
              "onOpponentVulnerable",
              "onCollision",
              "onKnockout",
              "onObjectiveComplete",
              "onRoundEnd"
            ],
            "weights": {
              "move_toward_objective": 0.33,
              "avoid_incoming_hazard": 0.22,
              "activate_trap_on_timing_window": 0.18,
              "take_shortcut": 0.11,
              "bait_opponent": 0.08,
              "recover_after_hit": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 500,
                "trap_timing_error_ms": 350,
                "route_optimization": 0.3
              },
              "normal": {
                "reaction_delay_ms": 300,
                "trap_timing_error_ms": 180,
                "route_optimization": 0.62
              },
              "hard": {
                "reaction_delay_ms": 170,
                "trap_timing_error_ms": 80,
                "route_optimization": 0.88
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          },
          "retropingpong": {
            "sourceGameId": "ping_pong",
            "title": "Ping Pong",
            "objective": "Win rallies by legally serving and returning the ball until the opponent misses, hits the net, hits out, or violates a rule.",
            "coreRules": {
              "serve": [
                "Serve begins with the ball resting on an open palm.",
                "Ball is tossed at least 6 inches upward.",
                "Serve is struck from behind the table.",
                "Ball must bounce once on the server's side, clear the net, and land on the receiver's side.",
                "A net touch during serve requires a re-serve if the serve otherwise lands legally."
              ],
              "rally": [
                "After service, players alternate returns after one bounce on their side.",
                "If the ball clips the net during regular play and lands legally on the opponent's side, play continues."
              ],
              "serve_rotation": "Server changes every two points until the game ends.",
              "singles": "Serve can land anywhere legal on the opponent's side.",
              "doubles": [
                "Serve must travel diagonally from the server's right side to the receiver's right side.",
                "Teammates must alternate hits during a rally.",
                "Serve and receive order rotates between teammates."
              ]
            },
            "strategyProfiles": {
              "beginner": [
                "Prioritize legal serves and consistent returns over risky winners.",
                "Stay balanced and reposition after every shot.",
                "Use controlled drives and blocks until timing improves.",
                "Aim to the opponent's weaker side rather than only hitting hard."
              ],
              "doubles": [
                "Communicate who will move where after each hit.",
                "Keep alternating-hit movement clear to avoid crowding.",
                "Use diagonal serves with safety before trying high-spin serves."
              ],
              "advanced": [
                "Vary serve placement and spin.",
                "Use pushes to keep the ball low and force pop-ups.",
                "Attack high returns with smashes only when positioned."
              ]
            },
            "controls": null,
            "hazards": null,
            "roles": [
              "server",
              "receiver",
              "doubles_partner"
            ],
            "stateMemory": [
              "score",
              "server",
              "serve_count",
              "rally_count",
              "opponent_position",
              "opponent_weak_side",
              "spin_estimate",
              "last_stroke",
              "ball_trajectory",
              "reaction_window"
            ],
            "decisionHooks": [
              "onMatchStart",
              "onServeTurn",
              "onServeContact",
              "onBallIncoming",
              "onBounce",
              "onReturnWindow",
              "onPointEnd",
              "onServeRotation",
              "onGameEnd"
            ],
            "weights": {
              "return_consistency": 0.3,
              "placement_to_open_table": 0.2,
              "spin_control": 0.15,
              "opponent_weak_side": 0.14,
              "attack_high_ball": 0.13,
              "recover_position": 0.08
            },
            "secondaryWeights": {},
            "meetingBehavior": null,
            "difficultyParameters": {
              "easy": {
                "reaction_delay_ms": 420,
                "placement_error": 0.25,
                "spin_read_accuracy": 0.35
              },
              "normal": {
                "reaction_delay_ms": 260,
                "placement_error": 0.14,
                "spin_read_accuracy": 0.62
              },
              "hard": {
                "reaction_delay_ms": 145,
                "placement_error": 0.06,
                "spin_read_accuracy": 0.86
              }
            },
            "randomizerFields": [
              "risk_tolerance",
              "patience",
              "aggression",
              "defense",
              "reaction_speed",
              "memory_span",
              "deception",
              "teamwork"
            ]
          }
        },
        "skillModel": {
          "amongus": {
            "skillScore": 70.4,
            "difficulty": "normal",
            "roleBias": "crewmate-leaning",
            "reactionDelayBiasMs": 204,
            "mistakeRate": 0.144
          },
          "8ballclassic": {
            "skillScore": 74.5,
            "difficulty": "normal",
            "roleBias": "shooter",
            "reactionDelayBiasMs": 191,
            "mistakeRate": 0.133
          },
          "houseofhazards": {
            "skillScore": 76.2,
            "difficulty": "normal",
            "roleBias": "objective-runner",
            "reactionDelayBiasMs": 186,
            "mistakeRate": 0.128
          },
          "retropingpong": {
            "skillScore": 82.0,
            "difficulty": "hard",
            "roleBias": "rally-defender",
            "reactionDelayBiasMs": 167,
            "mistakeRate": 0.112
          }
        }
      }
    }
  ],
  "generatedAt": "2026-06-25T05:41:31.504373+00:00",
  "notes": [
    "Each bot profile contains its own embedded scanner/randomizer brain.",
    "The shared engine is only a loader/adapter and does not contain a separate bot personality.",
    "Game knowledge from game_json_files.zip has been compacted into each bot profile under embeddedScannerRandomizer.gameKnowledge."
  ]
};

window.SOCIALSAPPLICATION_GAME_BOT_SUPPORT = {
  "schema": "socialsapplication.static_computer_players.v3.windows_safe",
  "generatedAt": "2026-06-25T05:41:31.504393+00:00",
  "selectionRules": {
    "requestedBotRange": [
      1,
      5
    ],
    "effectiveBotLimit": "min(requested count, 5, game.maxPlayers - 1)",
    "onlyUseBotsWithSupportedGameSlug": true,
    "offlineStaticOnly": true,
    "scannerRandomizerLocation": "embedded inside each bot profile under embeddedScannerRandomizer; no separate scanner bot",
    "topLevelLayout": [
      "Play_Against_The_Computer.html",
      "games/",
      "docs/",
      "bot-engine/"
    ]
  },
  "games": [
    {
      "slug": "amongus",
      "title": "Among Us",
      "file": "games/amongus.html",
      "filename": "amongus.html",
      "genre": "social deduction / stealth",
      "mobileFit": "mobile-friendly / touch-simple",
      "multiplayerType": "multiplayer franchise; offline HTML true online/local multiplayer not guaranteed without a backend/server",
      "maxPlayers": 10,
      "categories": [
        "mobileFriendly",
        "multiplayer"
      ],
      "notes": "Keep: massive social-deduction brand and nerdy group fit; verify offline multiplayer behavior.",
      "botSkillTags": [
        "avoid_suspicious_isolation",
        "avoid_visual_task_claim",
        "call_emergency_when_confident",
        "check_critical_sabotage",
        "create_alibi",
        "crew protection",
        "fake_task_route",
        "finish_nearby_tasks",
        "gather_evidence",
        "impostor deception",
        "route memory",
        "sabotage_to_split_crew",
        "seek_isolated_target",
        "shadow_trusted_player",
        "social deduction",
        "support_wrong_accusation",
        "suspicion map",
        "task/vote logic"
      ],
      "defaultBotCount": 5,
      "hookAdapter": "socialsapplication-amongus-gameplay-hook",
      "botKnowledgeSource": "among_us.json",
      "decisionHooks": [
        "onLobbySettingsLoaded",
        "onRoleAssigned",
        "onRoundStart",
        "onTaskAvailable",
        "onPlayerSeen",
        "onBodyReported",
        "onEmergencyMeeting",
        "onDiscussionStart",
        "onVoteStart",
        "onVoteEnd",
        "onSabotageAvailable",
        "onKillCooldownReady",
        "onDeath",
        "onGhostTaskAvailable"
      ],
      "stateMemory": [
        "last_seen_players",
        "recent_rooms",
        "task_claims",
        "confirmed_visuals",
        "votes",
        "suspicion_scores",
        "kill_cooldown",
        "meeting_count",
        "body_reports",
        "sabotage_events"
      ]
    },
    {
      "slug": "8ballclassic",
      "title": "8 Ball Classic",
      "file": "games/8ballclassic.html",
      "filename": "8ballclassic.html",
      "genre": "pool / billiards",
      "mobileFit": "mobile-friendly / touch-simple",
      "multiplayerType": "turn-based/local same-device; exact offline mode should be tested",
      "maxPlayers": 2,
      "categories": [
        "mobileFriendly",
        "multiplayer"
      ],
      "notes": "Keep by user preference: your audience prefers pool over Pac-Man; this adds a casual, turn-based, mobile-friendly competitive slot.",
      "botSkillTags": [
        "bank shot",
        "cue power",
        "cue_ball_position_after_shot",
        "eight_ball_path_setup",
        "legal_ball_priority",
        "opponent_denial",
        "pocket_probability",
        "position planning",
        "safety leave",
        "safety_option",
        "shot angle"
      ],
      "defaultBotCount": 1,
      "hookAdapter": "socialsapplication-8ballclassic-gameplay-hook",
      "botKnowledgeSource": "eight_ball_pool.json",
      "decisionHooks": [
        "onRack",
        "onBreak",
        "onTurnStart",
        "onAimEvaluate",
        "onCallShot",
        "onShotPowerSelect",
        "onShotResolved",
        "onFoul",
        "onGroupAssigned",
        "onEightBallReady",
        "onGameEnd"
      ],
      "stateMemory": [
        "assigned_group",
        "pocketed_balls",
        "open_table",
        "called_ball",
        "called_pocket",
        "cue_ball_position",
        "object_ball_positions",
        "foul_history",
        "eight_ball_ready",
        "opponent_skill_estimate"
      ]
    },
    {
      "slug": "houseofhazards",
      "title": "House of Hazards",
      "file": "games/houseofhazards.html",
      "filename": "houseofhazards.html",
      "genre": "party obstacle multiplayer",
      "mobileFit": "desktop-only / desktop-preferred",
      "multiplayerType": "local same-device party multiplayer, up to 4",
      "maxPlayers": 4,
      "categories": [
        "desktopOnly",
        "multiplayer"
      ],
      "notes": "Keep: chaotic local party multiplayer/running-around fit.",
      "botSkillTags": [
        "activate_trap_on_timing_window",
        "avoid_incoming_hazard",
        "bait_opponent",
        "hazard timing",
        "jump/duck movement",
        "move_toward_objective",
        "objective rushing",
        "recover_after_hit",
        "sabotage windows",
        "take_shortcut"
      ],
      "defaultBotCount": 3,
      "hookAdapter": "socialsapplication-houseofhazards-gameplay-hook",
      "botKnowledgeSource": "house_of_hazards.json",
      "decisionHooks": [
        "onRoundStart",
        "onWheelResult",
        "onObjectiveAssigned",
        "onHazardTimer",
        "onTrapReady",
        "onOpponentVulnerable",
        "onCollision",
        "onKnockout",
        "onObjectiveComplete",
        "onRoundEnd"
      ],
      "stateMemory": [
        "current_objective",
        "own_position",
        "opponent_positions",
        "hazard_timers",
        "trap_ready_state",
        "round_rules",
        "last_wheel_result",
        "safe_routes",
        "recent_knockouts"
      ]
    },
    {
      "slug": "retropingpong",
      "title": "Retro Ping Pong",
      "file": "games/retropingpong.html",
      "filename": "retropingpong.html",
      "genre": "arcade sports",
      "mobileFit": "mobile-friendly / touch-simple",
      "multiplayerType": "local same-device 2-player",
      "maxPlayers": 2,
      "categories": [
        "mobileFriendly",
        "multiplayer"
      ],
      "notes": "Keep: small, simple 2-player option.",
      "botSkillTags": [
        "angle response",
        "attack_high_ball",
        "opponent_weak_side",
        "paddle tracking",
        "placement_to_open_table",
        "rally defense",
        "reaction timing",
        "recover_position",
        "return_consistency",
        "spin_control"
      ],
      "defaultBotCount": 1,
      "hookAdapter": "socialsapplication-retropingpong-gameplay-hook",
      "botKnowledgeSource": "ping_pong.json",
      "decisionHooks": [
        "onMatchStart",
        "onServeTurn",
        "onServeContact",
        "onBallIncoming",
        "onBounce",
        "onReturnWindow",
        "onPointEnd",
        "onServeRotation",
        "onGameEnd"
      ],
      "stateMemory": [
        "score",
        "server",
        "serve_count",
        "rally_count",
        "opponent_position",
        "opponent_weak_side",
        "spin_estimate",
        "last_stroke",
        "ball_trajectory",
        "reaction_window"
      ]
    }
  ]
};
