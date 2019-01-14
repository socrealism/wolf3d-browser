"use strict";
Wolf.Weapon = (function () {
    function fireHit(game, player) {
        var level = game.level, closest, dist, d1, n, shotDist, damage, guard;
        Wolf.Sound.startSound(null, null, 0, Sound.CHAN_WEAPON, "assets/lsfx/023.wav", 1, Sound.ATTN_NORM, 0);
        dist = 0x7fffffff;
        closest = null;
        for (n = 0; n < level.state.numGuards; ++n) {
            guard = level.state.guards[n];
            if (guard.flags & Wolf.FL_SHOOTABLE) {
                shotDist = Wolf.Math.point2LineDist(guard.x - player.position.x, guard.y - player.position.y, player.angle);
                if (shotDist > (2 * Wolf.TILEGLOBAL / 3)) {
                    continue;
                }
                d1 = Wolf.Math.lineLen2Point(guard.x - player.position.x, guard.y - player.position.y, player.angle);
                if (d1 < 0 || d1 > dist) {
                    continue;
                }
                if (!Wolf.Level.checkLine(guard.x, guard.y, player.position.x, player.position.y, level)) {
                    continue;
                }
                dist = d1;
                closest = guard;
            }
        }
        if (!closest || dist > Wolf.TILE2POS(1)) {
            return;
        }
        damage = Random.get() >> 4;
        Wolf.ActorAI.damageActor(closest, game, player, damage);
    }
    function fireLead(game, player) {
        var level = game.level, closest, damage, dx, dy, dist, d1, shotDist, n, guard;
        switch (player.weapon) {
            case Wolf.WEAPON_PISTOL:
                Wolf.Sound.startSound(null, null, 0, Sound.CHAN_WEAPON, "assets/sfx/012.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.WEAPON_AUTO:
                Wolf.Sound.startSound(null, null, 0, Sound.CHAN_WEAPON, "assets/sfx/011.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Wolf.WEAPON_CHAIN:
                Wolf.Sound.startSound(null, null, 0, Sound.CHAN_WEAPON, "assets/sfx/013.wav", 1, Sound.ATTN_NORM, 0);
                break;
        }
        player.madenoise = true;
        dist = 0x7fffffff;
        closest = null;
        for (n = 0; n < level.state.numGuards; ++n) {
            guard = level.state.guards[n];
            if (guard.flags & Wolf.FL_SHOOTABLE) {
                shotDist = Wolf.Math.point2LineDist(guard.x - player.position.x, guard.y - player.position.y, player.angle);
                if (shotDist > (2 * Wolf.TILEGLOBAL / 3)) {
                    continue;
                }
                d1 = Wolf.Math.lineLen2Point(guard.x - player.position.x, guard.y - player.position.y, player.angle);
                if (d1 < 0 || d1 > dist) {
                    continue;
                }
                if (!Wolf.Level.checkLine(guard.x, guard.y, player.position.x, player.position.y, level)) {
                    continue;
                }
                dist = d1;
                closest = guard;
            }
        }
        if (!closest) {
            var tracePoint = {
                angle: Wolf.Math.normalizeAngle(player.angle - Wolf.DEG2FINE(2) + (Math.random() * 0x10000) % (Wolf.DEG2FINE(4))),
                x: player.position.x,
                y: player.position.y,
                flags: Raycaster.TRACE_BULLET
            };
            Wolf.Raycaster.trace(level, null, tracePoint);
            if (tracePoint.flags & Raycaster.TRACE_HIT_DOOR) {
                Wolf.Sound.startSound(null, null, 0, Sound.CHAN_AUTO, "assets/lsfx/028.wav", 1, Sound.ATTN_NORM, 0);
            }
            return;
        }
        dx = Math.abs(closest.tile.x - player.tile.x);
        dy = Math.abs(closest.tile.y - player.tile.y);
        dist = Math.max(dx, dy);
        if (dist < 2) {
            damage = Random.get() / 4;
        }
        else if (dist < 4) {
            damage = Random.get() / 6;
        }
        else {
            if (Random.get() / 12 < dist) {
                return;
            }
            damage = Random.get() / 6;
        }
        Wolf.ActorAI.damageActor(closest, game, player, damage);
    }
    return {
        fireHit: fireHit,
        fireLead: fireLead
    };
})();
