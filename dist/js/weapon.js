"use strict";
class Weapon {
    static fireHit(game, player) {
        var level = game.level, closest, dist, d1, n, shotDist, damage, guard;
        Sound.startSound(null, null, 0, Sound.CHAN_WEAPON, "assets/lsfx/023.wav", 1, Sound.ATTN_NORM, 0);
        dist = 0x7fffffff;
        closest = null;
        for (n = 0; n < level.state.numGuards; ++n) {
            guard = level.state.guards[n];
            if (guard.flags & Actors.FL_SHOOTABLE) {
                shotDist = Mathematik.point2LineDist(guard.x - player.position.x, guard.y - player.position.y, player.angle);
                if (shotDist > (2 * Wolf.TILEGLOBAL / 3)) {
                    continue;
                }
                d1 = Mathematik.lineLen2Point(guard.x - player.position.x, guard.y - player.position.y, player.angle);
                if (d1 < 0 || d1 > dist) {
                    continue;
                }
                if (!Level.checkLine(guard.x, guard.y, player.position.x, player.position.y, level)) {
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
        ActorAI.damageActor(closest, game, player, damage);
    }
    static fireLead(game, player) {
        var level = game.level, closest, damage, dx, dy, dist, d1, shotDist, n, guard;
        switch (player.weapon) {
            case Player.WEAPON_PISTOL:
                Sound.startSound(null, null, 0, Sound.CHAN_WEAPON, "assets/sfx/012.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Player.WEAPON_AUTO:
                Sound.startSound(null, null, 0, Sound.CHAN_WEAPON, "assets/sfx/011.wav", 1, Sound.ATTN_NORM, 0);
                break;
            case Player.WEAPON_CHAIN:
                Sound.startSound(null, null, 0, Sound.CHAN_WEAPON, "assets/sfx/013.wav", 1, Sound.ATTN_NORM, 0);
                break;
        }
        player.madenoise = true;
        dist = 0x7fffffff;
        closest = null;
        for (n = 0; n < level.state.numGuards; ++n) {
            guard = level.state.guards[n];
            if (guard.flags & Actors.FL_SHOOTABLE) {
                shotDist = Mathematik.point2LineDist(guard.x - player.position.x, guard.y - player.position.y, player.angle);
                if (shotDist > (2 * Wolf.TILEGLOBAL / 3)) {
                    continue;
                }
                d1 = Mathematik.lineLen2Point(guard.x - player.position.x, guard.y - player.position.y, player.angle);
                if (d1 < 0 || d1 > dist) {
                    continue;
                }
                if (!Level.checkLine(guard.x, guard.y, player.position.x, player.position.y, level)) {
                    continue;
                }
                dist = d1;
                closest = guard;
            }
        }
        if (!closest) {
            var tracePoint = {
                angle: Mathematik.normalizeAngle(player.angle - Wolf.DEG2FINE(2) + (Math.random() * 0x10000) % (Wolf.DEG2FINE(4))),
                x: player.position.x,
                y: player.position.y,
                flags: Raycaster.TRACE_BULLET
            };
            Raycaster.trace(level, null, tracePoint);
            if (tracePoint.flags & Raycaster.TRACE_HIT_DOOR) {
                Sound.startSound(null, null, 0, Sound.CHAN_AUTO, "assets/lsfx/028.wav", 1, Sound.ATTN_NORM, 0);
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
        ActorAI.damageActor(closest, game, player, damage);
    }
}
