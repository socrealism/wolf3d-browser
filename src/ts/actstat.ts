/**
 * @description Actors stat
 */
class Actstat {
    static ST_INFO_NULL = [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead];

    /*
        1-if object can be rotated, 0 if one sprite for every direction
        base object's state texture if rotation is on facing player
        after how man frames change state to .next_state
        what to do every frame
        what to do once per state
        next state
    */

    //var objstate[Actors.NUMENEMIES][Actors.NUMSTATES] = [
    static objstate = [
        // en_guard,
        [
            [1, Sprites.SPR_GRD_S_1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            [1, Sprites.SPR_GRD_W1_1, 20, AI.T_Path, null, Actors.st_path1s], // Actors.st_path1,
            [1, Sprites.SPR_GRD_W1_1, 5, null, null, Actors.st_path2], // Actors.st_path1s,
            [1, Sprites.SPR_GRD_W2_1, 15, AI.T_Path, null, Actors.st_path3], // Actors.st_path2,
            [1, Sprites.SPR_GRD_W3_1, 20, AI.T_Path, null, Actors.st_path3s], // Actors.st_path3,
            [1, Sprites.SPR_GRD_W3_1, 5, null, null, Actors.st_path4], // Actors.st_path3s,
            [1, Sprites.SPR_GRD_W4_1, 15, AI.T_Path, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_GRD_PAIN_1, 10, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_GRD_PAIN_2, 10, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_GRD_SHOOT1, 20, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_GRD_SHOOT2, 20, null, AI.T_Shoot, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_GRD_SHOOT3, 20, null, null, Actors.st_chase1],// Actors.st_shoot3,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1], // Actors.st_shoot4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1], // Actors.st_shoot5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1], // Actors.st_shoot6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1], // Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1], // Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1], // Actors.st_shoot9,

            [1, Sprites.SPR_GRD_W1_1, 10, AI.T_Chase, null, Actors.st_chase1s], // Actors.st_chase1,
            [1, Sprites.SPR_GRD_W1_1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [1, Sprites.SPR_GRD_W2_1, 8, AI.T_Chase, null, Actors.st_chase3], // Actors.st_chase2,
            [1, Sprites.SPR_GRD_W3_1, 10, AI.T_Chase, null, Actors.st_chase3s], // Actors.st_chase3,
            [1, Sprites.SPR_GRD_W3_1, 3, null, null, Actors.st_chase4], // Actors.st_chase3s,
            [1, Sprites.SPR_GRD_W4_1, 8, AI.T_Chase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_GRD_DIE_1, 15, null, ActorAI.deathScream, Actors.st_die2], // Actors.st_die1,
            [0, Sprites.SPR_GRD_DIE_2, 15, null, null, Actors.st_die3], // Actors.st_die2,
            [0, Sprites.SPR_GRD_DIE_3, 15, null, null, Actors.st_dead], // Actors.st_die3,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead], // Actors.st_die4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead], // Actors.st_die5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead], // Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead], // Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead], // Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead], // Actors.st_die9,

            [0, Sprites.SPR_GRD_DEAD, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_officer,
        [
            [1, Sprites.SPR_OFC_S_1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            [1, Sprites.SPR_OFC_W1_1, 20, AI.T_Path, null, Actors.st_path1s],// Actors.st_path1,
            [1, Sprites.SPR_OFC_W1_1, 5, null, null, Actors.st_path2], // Actors.st_path1s,
            [1, Sprites.SPR_OFC_W2_1, 15, AI.T_Path, null, Actors.st_path3], // Actors.st_path2,
            [1, Sprites.SPR_OFC_W3_1, 20, AI.T_Path, null, Actors.st_path3s],// Actors.st_path3,
            [1, Sprites.SPR_OFC_W3_1, 5, null, null, Actors.st_path4], // Actors.st_path3s,
            [1, Sprites.SPR_OFC_W4_1, 15, AI.T_Path, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_OFC_PAIN_1, 10, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_OFC_PAIN_2, 10, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_OFC_SHOOT1, 6, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_OFC_SHOOT2, 20, null, AI.T_Shoot, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_OFC_SHOOT3, 10, null, null, Actors.st_chase1],// Actors.st_shoot3,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [1, Sprites.SPR_OFC_W1_1, 10, AI.T_Chase, null, Actors.st_chase1s],// Actors.st_chase1,
            [1, Sprites.SPR_OFC_W1_1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [1, Sprites.SPR_OFC_W2_1, 8, AI.T_Chase, null, Actors.st_chase3], // Actors.st_chase2,
            [1, Sprites.SPR_OFC_W3_1, 10, AI.T_Chase, null, Actors.st_chase3s],// Actors.st_chase3,
            [1, Sprites.SPR_OFC_W3_1, 3, null, null, Actors.st_chase4], // Actors.st_chase3s,
            [1, Sprites.SPR_OFC_W4_1, 8, AI.T_Chase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_OFC_DIE_1, 11, null, ActorAI.deathScream, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_OFC_DIE_2, 11, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_OFC_DIE_3, 11, null, null, Actors.st_dead],// Actors.st_die3,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_OFC_DEAD, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_ss,
        [
            [1, Sprites.SPR_SS_S_1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            [1, Sprites.SPR_SS_W1_1, 20, AI.T_Path, null, Actors.st_path1s],// Actors.st_path1,
            [1, Sprites.SPR_SS_W1_1, 5, null, null, Actors.st_path2], // Actors.st_path1s,
            [1, Sprites.SPR_SS_W2_1, 15, AI.T_Path, null, Actors.st_path3], // Actors.st_path2,
            [1, Sprites.SPR_SS_W3_1, 20, AI.T_Path, null, Actors.st_path3s],// Actors.st_path3,
            [1, Sprites.SPR_SS_W3_1, 5, null, null, Actors.st_path4], // Actors.st_path3s,
            [1, Sprites.SPR_SS_W4_1, 15, AI.T_Path, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_SS_PAIN_1, 10, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_SS_PAIN_2, 10, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_SS_SHOOT1, 20, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_SS_SHOOT2, 20, null, AI.T_Shoot, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_SS_SHOOT3, 10, null, null, Actors.st_shoot4],// Actors.st_shoot3,
            [0, Sprites.SPR_SS_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot5],// Actors.st_shoot4,
            [0, Sprites.SPR_SS_SHOOT3, 10, null, null, Actors.st_shoot6],// Actors.st_shoot5,
            [0, Sprites.SPR_SS_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot7],// Actors.st_shoot6,
            [0, Sprites.SPR_SS_SHOOT3, 10, null, null, Actors.st_shoot8],// Actors.st_shoot7,
            [0, Sprites.SPR_SS_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot9],// Actors.st_shoot8,
            [0, Sprites.SPR_SS_SHOOT3, 10, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [1, Sprites.SPR_SS_W1_1, 10, AI.T_Chase, null, Actors.st_chase1s],// Actors.st_chase1,
            [1, Sprites.SPR_SS_W1_1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [1, Sprites.SPR_SS_W2_1, 8, AI.T_Chase, null, Actors.st_chase3], // Actors.st_chase2,
            [1, Sprites.SPR_SS_W3_1, 10, AI.T_Chase, null, Actors.st_chase3s],// Actors.st_chase3,
            [1, Sprites.SPR_SS_W3_1, 3, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [1, Sprites.SPR_SS_W4_1, 8, AI.T_Chase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_SS_DIE_1, 15, null, ActorAI.deathScream, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_SS_DIE_2, 15, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_SS_DIE_3, 15, null, null, Actors.st_dead],// Actors.st_die3,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_SS_DEAD, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_dog,
        [
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_stand], // Actors.st_stand,

            [1, Sprites.SPR_DOG_W1_1, 20, AI.T_Path, null, Actors.st_path1s],// Actors.st_path1,
            [1, Sprites.SPR_DOG_W1_1, 5, null, null, Actors.st_path2], // Actors.st_path1s,
            [1, Sprites.SPR_DOG_W2_1, 15, AI.T_Path, null, Actors.st_path3], // Actors.st_path2,
            [1, Sprites.SPR_DOG_W3_1, 20, AI.T_Path, null, Actors.st_path3s],// Actors.st_path3,
            [1, Sprites.SPR_DOG_W3_1, 5, null, null, Actors.st_path4], // Actors.st_path3s,
            [1, Sprites.SPR_DOG_W4_1, 15, AI.T_Path, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_DOG_JUMP1, 10, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_DOG_JUMP2, 10, null, AI.T_Bite, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_DOG_JUMP3, 10, null, null, Actors.st_shoot4],// Actors.st_shoot3,
            [0, Sprites.SPR_DOG_JUMP1, 10, null, null, Actors.st_shoot5],// Actors.st_shoot4,
            [0, Sprites.SPR_DOG_W1_1, 10, null, null, Actors.st_chase1],// Actors.st_shoot5,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [1, Sprites.SPR_DOG_W1_1, 10, AI.T_DogChase, null, Actors.st_chase1s],// Actors.st_chase1,
            [1, Sprites.SPR_DOG_W1_1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [1, Sprites.SPR_DOG_W2_1, 8, AI.T_DogChase, null, Actors.st_chase3], // Actors.st_chase2,
            [1, Sprites.SPR_DOG_W3_1, 10, AI.T_DogChase, null, Actors.st_chase3s],// Actors.st_chase3,
            [1, Sprites.SPR_DOG_W3_1, 3, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [1, Sprites.SPR_DOG_W4_1, 8, AI.T_DogChase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_DOG_DIE_1, 15, null, ActorAI.deathScream, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_DOG_DIE_2, 15, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_DOG_DIE_3, 15, null, null, Actors.st_dead],// Actors.st_die3,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_DOG_DEAD, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_boss,
        [
            [0, Sprites.SPR_BOSS_W1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1s],// Actors.st_path1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3s],// Actors.st_path3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_BOSS_SHOOT1, 30, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_BOSS_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_BOSS_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot4],// Actors.st_shoot3,
            [0, Sprites.SPR_BOSS_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot5],// Actors.st_shoot4,
            [0, Sprites.SPR_BOSS_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot6],// Actors.st_shoot5,
            [0, Sprites.SPR_BOSS_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot7],// Actors.st_shoot6,
            [0, Sprites.SPR_BOSS_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot8],// Actors.st_shoot7,
            [0, Sprites.SPR_BOSS_SHOOT1, 10, null, null, Actors.st_chase1],// Actors.st_shoot8,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [0, Sprites.SPR_BOSS_W1, 10, AI.T_Chase, null, Actors.st_chase1s],// Actors.st_chase1,
            [0, Sprites.SPR_BOSS_W1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [0, Sprites.SPR_BOSS_W2, 8, AI.T_Chase, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_BOSS_W3, 10, AI.T_Chase, null, Actors.st_chase3s],// Actors.st_chase3,
            [0, Sprites.SPR_BOSS_W3, 3, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [0, Sprites.SPR_BOSS_W4, 8, AI.T_Chase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_BOSS_DIE1, 15, null, ActorAI.deathScream, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_BOSS_DIE2, 15, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_BOSS_DIE3, 15, null, null, Actors.st_dead],// Actors.st_die3,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_BOSS_DEAD, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_schabbs,
        [
            [0, Sprites.SPR_SCHABB_W1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1s],// Actors.st_path1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3s],// Actors.st_path3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_SCHABB_SHOOT1, 30, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_SCHABB_SHOOT2, 10, null, AI.T_Launch, Actors.st_chase1],// Actors.st_shoot2,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],//  Actors.st_shoot4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [0, Sprites.SPR_SCHABB_W1, 10, AI.T_BossChase, null, Actors.st_chase1s],// Actors.st_chase1,
            [0, Sprites.SPR_SCHABB_W1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [0, Sprites.SPR_SCHABB_W2, 8, AI.T_BossChase, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_SCHABB_W3, 10, AI.T_BossChase, null, Actors.st_chase3s],// Actors.st_chase3,
            [0, Sprites.SPR_SCHABB_W3, 3, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [0, Sprites.SPR_SCHABB_W4, 8, AI.T_BossChase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_SCHABB_W1, 10, null, ActorAI.deathScream, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_SCHABB_W1, 10, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_SCHABB_DIE1, 10, null, null, Actors.st_die4],// Actors.st_die3,
            [0, Sprites.SPR_SCHABB_DIE2, 10, null, null, Actors.st_die5],// Actors.st_die4,
            [0, Sprites.SPR_SCHABB_DIE3, 10, null, null, Actors.st_dead],// Actors.st_die5,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_SCHABB_DEAD, 0, null, ActorAI.startDeathCam, Actors.st_dead] // Actors.st_dead
        ],
        // en_fake,
        [
            [0, Sprites.SPR_FAKE_W1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1s],// Actors.st_path1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3s],// Actors.st_path3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_FAKE_SHOOT, 8, null, AI.T_Launch, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_FAKE_SHOOT, 8, null, AI.T_Launch, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_FAKE_SHOOT, 8, null, AI.T_Launch, Actors.st_shoot4],// Actors.st_shoot3,
            [0, Sprites.SPR_FAKE_SHOOT, 8, null, AI.T_Launch, Actors.st_shoot5],// Actors.st_shoot4,
            [0, Sprites.SPR_FAKE_SHOOT, 8, null, AI.T_Launch, Actors.st_shoot6],// Actors.st_shoot4,
            [0, Sprites.SPR_FAKE_SHOOT, 8, null, AI.T_Launch, Actors.st_shoot7],// Actors.st_shoot4,
            [0, Sprites.SPR_FAKE_SHOOT, 8, null, AI.T_Launch, Actors.st_shoot8],// Actors.st_shoot4,
            [0, Sprites.SPR_FAKE_SHOOT, 8, null, AI.T_Launch, Actors.st_shoot9],// Actors.st_shoot4,
            [0, Sprites.SPR_FAKE_SHOOT, 8, null, null, Actors.st_chase1],// Actors.st_shoot4,

            [0, Sprites.SPR_FAKE_W1, 10, AI.T_Fake, null, Actors.st_chase1s],// Actors.st_chase1,
            [0, Sprites.SPR_FAKE_W1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [0, Sprites.SPR_FAKE_W2, 8, AI.T_Fake, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_FAKE_W3, 10, AI.T_Fake, null, Actors.st_chase3s],// Actors.st_chase3,
            [0, Sprites.SPR_FAKE_W3, 3, null, null, Actors.st_chase4], // Actors.st_chase3s,
            [0, Sprites.SPR_FAKE_W4, 8, AI.T_Fake, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_FAKE_DIE1, 10, null, ActorAI.deathScream, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_FAKE_DIE2, 10, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_FAKE_DIE3, 10, null, null, Actors.st_die4],// Actors.st_die3,
            [0, Sprites.SPR_FAKE_DIE4, 10, null, null, Actors.st_die5],// Actors.st_die4,
            [0, Sprites.SPR_FAKE_DIE5, 10, null, null, Actors.st_dead],// Actors.st_die5,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_FAKE_DEAD, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_hitler, (mecha)
        [
            [0, Sprites.SPR_MECHA_W1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1s],// Actors.st_path1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3s],// Actors.st_path3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_MECHA_SHOOT1, 30, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_MECHA_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_MECHA_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot4],// Actors.st_shoot3,
            [0, Sprites.SPR_MECHA_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot5],// Actors.st_shoot4,
            [0, Sprites.SPR_MECHA_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot6],// Actors.st_shoot5,
            [0, Sprites.SPR_MECHA_SHOOT2, 10, null, AI.T_Shoot, Actors.st_chase1],// Actors.st_shoot6,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot8],// Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot9],// Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [0, Sprites.SPR_MECHA_W1, 10, AI.T_Chase, ActorAI.mechaSound, Actors.st_chase1s],// Actors.st_chase1,
            [0, Sprites.SPR_MECHA_W1, 6, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [0, Sprites.SPR_MECHA_W2, 8, AI.T_Chase, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_MECHA_W3, 10, AI.T_Chase, ActorAI.mechaSound, Actors.st_chase3s],// Actors.st_chase3,
            [0, Sprites.SPR_MECHA_W3, 6, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [0, Sprites.SPR_MECHA_W4, 8, AI.T_Chase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_MECHA_DIE1, 10, null, ActorAI.deathScream, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_MECHA_DIE2, 10, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_MECHA_DIE3, 10, null, ActorAI.hitlerMorph, Actors.st_dead],// Actors.st_die3,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_MECHA_DEAD, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_hitler,
        [
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_stand], // Actors.st_stand,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1s],// Actors.st_path1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3s],// Actors.st_path3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_HITLER_SHOOT1, 30, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_HITLER_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_HITLER_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot4],// Actors.st_shoot3,
            [0, Sprites.SPR_HITLER_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot5],// Actors.st_shoot4,
            [0, Sprites.SPR_HITLER_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot6],// Actors.st_shoot5,
            [0, Sprites.SPR_HITLER_SHOOT2, 10, null, AI.T_Shoot, Actors.st_chase1],// Actors.st_shoot6,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot8],// Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot9],// Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [0, Sprites.SPR_HITLER_W1, 6, AI.T_Chase, null, Actors.st_chase1s], // Actors.st_chase1,
            [0, Sprites.SPR_HITLER_W1, 4, null, null, Actors.st_chase2],  // Actors.st_chase1s,
            [0, Sprites.SPR_HITLER_W2, 2, AI.T_Chase, null, Actors.st_chase3],  // Actors.st_chase2,
            [0, Sprites.SPR_HITLER_W3, 6, AI.T_Chase, null, Actors.st_chase3s], // Actors.st_chase3,
            [0, Sprites.SPR_HITLER_W3, 4, null, null, Actors.st_chase4], // Actors.st_chase3s,
            [0, Sprites.SPR_HITLER_W4, 2, AI.T_Chase, null, Actors.st_chase1],  // Actors.st_chase4,

            [0, Sprites.SPR_HITLER_W1, 1, null, ActorAI.deathScream, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_HITLER_W1, 10, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_HITLER_DIE1, 10, null, null, Actors.st_die4],// Actors.st_die3,
            [0, Sprites.SPR_HITLER_DIE2, 10, null, null, Actors.st_die5],// Actors.st_die4,
            [0, Sprites.SPR_HITLER_DIE3, 10, null, null, Actors.st_die6],// Actors.st_die5,
            [0, Sprites.SPR_HITLER_DIE4, 10, null, null, Actors.st_die7],// Actors.st_die6,
            [0, Sprites.SPR_HITLER_DIE5, 10, null, null, Actors.st_die8],// Actors.st_die7,
            [0, Sprites.SPR_HITLER_DIE6, 10, null, null, Actors.st_die9],// Actors.st_die8,
            [0, Sprites.SPR_HITLER_DIE7, 10, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_HITLER_DEAD, 0, null, ActorAI.startDeathCam, Actors.st_dead] // Actors.st_dead
        ],
        // en_mutant,
        [
            [1, Sprites.SPR_MUT_S_1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            [1, Sprites.SPR_MUT_W1_1, 20, AI.T_Path, null, Actors.st_path1s],// Actors.st_path1,
            [1, Sprites.SPR_MUT_W1_1, 5, null, null, Actors.st_path2], // Actors.st_path1s,
            [1, Sprites.SPR_MUT_W2_1, 15, AI.T_Path, null, Actors.st_path3], // Actors.st_path2,
            [1, Sprites.SPR_MUT_W3_1, 20, AI.T_Path, null, Actors.st_path3s],// Actors.st_path3,
            [1, Sprites.SPR_MUT_W3_1, 5, null, null, Actors.st_path4], // Actors.st_path3s,
            [1, Sprites.SPR_MUT_W4_1, 15, AI.T_Path, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_MUT_PAIN_1, 10, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_MUT_PAIN_2, 10, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_MUT_SHOOT1, 6, null, AI.T_Shoot, Actors.st_shoot2], // Actors.st_shoot1,
            [0, Sprites.SPR_MUT_SHOOT2, 20, null, null, Actors.st_shoot3], // Actors.st_shoot2,
            [0, Sprites.SPR_MUT_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot4], // Actors.st_shoot3,
            [0, Sprites.SPR_MUT_SHOOT4, 20, null, null, Actors.st_chase1], // Actors.st_shoot4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [1, Sprites.SPR_MUT_W1_1, 10, AI.T_Chase, null, Actors.st_chase1s],// Actors.st_chase1,
            [1, Sprites.SPR_MUT_W1_1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [1, Sprites.SPR_MUT_W2_1, 8, AI.T_Chase, null, Actors.st_chase3], // Actors.st_chase2,
            [1, Sprites.SPR_MUT_W3_1, 10, AI.T_Chase, null, Actors.st_chase3s],// Actors.st_chase3,
            [1, Sprites.SPR_MUT_W3_1, 3, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [1, Sprites.SPR_MUT_W4_1, 8, AI.T_Chase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_MUT_DIE_1, 7, null, ActorAI.deathScream, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_MUT_DIE_2, 7, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_MUT_DIE_3, 7, null, null, Actors.st_die4],// Actors.st_die3,
            [0, Sprites.SPR_MUT_DIE_4, 7, null, null, Actors.st_dead],// Actors.st_die4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_MUT_DEAD, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_blinky,
        [
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_stand], // Actors.st_stand,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1s],// Actors.st_path1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3s],// Actors.st_path3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot4],// Actors.st_shoot3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot5],// Actors.st_shoot4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot6],// Actors.st_shoot5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot8],// Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot9],// Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [0, Sprites.SPR_BLINKY_W1, 10, AI.T_Ghosts, null, Actors.st_chase2],// Actors.st_chase1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase2],            // Actors.st_chase1s,
            [0, Sprites.SPR_BLINKY_W2, 10, AI.T_Ghosts, null, Actors.st_chase1],// Actors.st_chase2,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase3s],// Actors.st_chase3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_DEMO, 10, null, null, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_DEMO, 10, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_DEMO, 10, null, null, Actors.st_dead],// Actors.st_die3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_clyde,
        [
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_stand], // Actors.st_stand,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1s],// Actors.st_path1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3s],// Actors.st_path3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot4],// Actors.st_shoot3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot5],// Actors.st_shoot4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot6],// Actors.st_shoot5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot8],// Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot9],// Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [0, Sprites.SPR_CLYDE_W1, 10, AI.T_Ghosts, null, Actors.st_chase2],// Actors.st_chase1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase2],            // Actors.st_chase1s,
            [0, Sprites.SPR_CLYDE_W2, 10, AI.T_Ghosts, null, Actors.st_chase1],// Actors.st_chase2,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase3s],// Actors.st_chase3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_DEMO, 10, null, null, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_DEMO, 10, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_DEMO, 10, null, null, Actors.st_dead],// Actors.st_die3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_pinky,
        [
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_stand], // Actors.st_stand,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1s],// Actors.st_path1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3s],// Actors.st_path3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot4],// Actors.st_shoot3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot5],// Actors.st_shoot4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot6],// Actors.st_shoot5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot8],// Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot9],// Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [0, Sprites.SPR_PINKY_W1, 10, AI.T_Ghosts, null, Actors.st_chase2],// Actors.st_chase1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase2],            // Actors.st_chase1s,
            [0, Sprites.SPR_PINKY_W2, 10, AI.T_Ghosts, null, Actors.st_chase1],// Actors.st_chase2,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase3s],// Actors.st_chase3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_DEMO, 10, null, null, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_DEMO, 10, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_DEMO, 10, null, null, Actors.st_dead],// Actors.st_die3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_inky,
        [
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_stand], // Actors.st_stand,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1s],// Actors.st_path1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3s],// Actors.st_path3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot4],// Actors.st_shoot3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot5],// Actors.st_shoot4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot6],// Actors.st_shoot5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot8],// Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_shoot9],// Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [0, Sprites.SPR_INKY_W1, 10, AI.T_Ghosts, null, Actors.st_chase2],// Actors.st_chase1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase2],            // Actors.st_chase1s,
            [0, Sprites.SPR_INKY_W2, 10, AI.T_Ghosts, null, Actors.st_chase1],// Actors.st_chase2,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase3s],// Actors.st_chase3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_DEMO, 10, null, null, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_DEMO, 10, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_DEMO, 10, null, null, Actors.st_dead],// Actors.st_die3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_gretel,
        [
            [0, Sprites.SPR_GRETEL_W1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1s],// Actors.st_path1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3s],// Actors.st_path3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_GRETEL_SHOOT1, 30, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_GRETEL_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_GRETEL_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot4],// Actors.st_shoot3,
            [0, Sprites.SPR_GRETEL_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot5],// Actors.st_shoot4,
            [0, Sprites.SPR_GRETEL_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot6],// Actors.st_shoot5,
            [0, Sprites.SPR_GRETEL_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot7],// Actors.st_shoot6,
            [0, Sprites.SPR_GRETEL_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot8],// Actors.st_shoot7,
            [0, Sprites.SPR_GRETEL_SHOOT1, 10, null, null, Actors.st_chase1],// Actors.st_shoot8,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [0, Sprites.SPR_GRETEL_W1, 10, AI.T_Chase, null, Actors.st_chase1s],// Actors.st_chase1,
            [0, Sprites.SPR_GRETEL_W1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [0, Sprites.SPR_GRETEL_W2, 8, AI.T_Chase, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_GRETEL_W3, 10, AI.T_Chase, null, Actors.st_chase3s],// Actors.st_chase3,
            [0, Sprites.SPR_GRETEL_W3, 3, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [0, Sprites.SPR_GRETEL_W4, 8, AI.T_Chase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_GRETEL_DIE1, 15, null, ActorAI.deathScream, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_GRETEL_DIE2, 15, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_GRETEL_DIE3, 15, null, null, Actors.st_dead],// Actors.st_die3,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_GRETEL_DEAD, 0, null, null, Actors.st_dead] // Actors.st_dead
        ],
        // en_gift,
        [
            [0, Sprites.SPR_GIFT_W1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1s],// Actors.st_path1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3s],// Actors.st_path3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_GIFT_SHOOT1, 30, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_GIFT_SHOOT2, 10, null, AI.T_Launch, Actors.st_chase1],// Actors.st_shoot2,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],//  Actors.st_shoot4,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot5,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [0, Sprites.SPR_GIFT_W1, 10, AI.T_BossChase, null, Actors.st_chase1s],// Actors.st_chase1,
            [0, Sprites.SPR_GIFT_W1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [0, Sprites.SPR_GIFT_W2, 8, AI.T_BossChase, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_GIFT_W3, 10, AI.T_BossChase, null, Actors.st_chase3s],// Actors.st_chase3,
            [0, Sprites.SPR_GIFT_W3, 3, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [0, Sprites.SPR_GIFT_W4, 8, AI.T_BossChase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_GIFT_W1, 10, null, ActorAI.deathScream, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_GIFT_W1, 10, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_GIFT_DIE1, 10, null, null, Actors.st_die4],// Actors.st_die3,
            [0, Sprites.SPR_GIFT_DIE2, 10, null, null, Actors.st_die5],// Actors.st_die4,
            [0, Sprites.SPR_GIFT_DIE3, 10, null, null, Actors.st_dead],// Actors.st_die5,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_GIFT_DEAD, 0, null, ActorAI.startDeathCam, Actors.st_dead] // Actors.st_dead
        ],
        // en_fat,
        [
            [0, Sprites.SPR_FAT_W1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1s],// Actors.st_path1,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path3s],// Actors.st_path3,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_path1], // Actors.st_path4,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_pain1,

            [0, Sprites.SPR_FAT_SHOOT1, 30, null, null, Actors.st_shoot2],// Actors.st_shoot1,
            [0, Sprites.SPR_FAT_SHOOT2, 10, null, AI.T_Launch, Actors.st_shoot3],// Actors.st_shoot2,
            [0, Sprites.SPR_FAT_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot4],// Actors.st_shoot3,
            [0, Sprites.SPR_FAT_SHOOT4, 10, null, AI.T_Shoot, Actors.st_shoot5],//  Actors.st_shoot4,
            [0, Sprites.SPR_FAT_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot6],// Actors.st_shoot5,
            [0, Sprites.SPR_FAT_SHOOT4, 10, null, AI.T_Shoot, Actors.st_chase1],// Actors.st_shoot6,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_chase1],// Actors.st_shoot9,

            [0, Sprites.SPR_FAT_W1, 10, AI.T_BossChase, null, Actors.st_chase1s],// Actors.st_chase1,
            [0, Sprites.SPR_FAT_W1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [0, Sprites.SPR_FAT_W2, 8, AI.T_BossChase, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_FAT_W3, 10, AI.T_BossChase, null, Actors.st_chase3s],// Actors.st_chase3,
            [0, Sprites.SPR_FAT_W3, 3, null, null, Actors.st_chase4],     // Actors.st_chase3s,
            [0, Sprites.SPR_FAT_W4, 8, AI.T_BossChase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_FAT_W1, 10, null, ActorAI.deathScream, Actors.st_die2],// Actors.st_die1,
            [0, Sprites.SPR_FAT_W1, 10, null, null, Actors.st_die3],// Actors.st_die2,
            [0, Sprites.SPR_FAT_DIE1, 10, null, null, Actors.st_die4],// Actors.st_die3,
            [0, Sprites.SPR_FAT_DIE2, 10, null, null, Actors.st_die5],// Actors.st_die4,
            [0, Sprites.SPR_FAT_DIE3, 10, null, null, Actors.st_dead],// Actors.st_die5,

            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die6,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die7,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die8,
            [0, Sprites.SPR_DEMO, 0, null, null, Actors.st_dead],// Actors.st_die9,

            [0, Sprites.SPR_FAT_DEAD, 0, null, ActorAI.startDeathCam, Actors.st_dead] // Actors.st_dead
        ],
        // --- Projectiles
        // en_needle,
        [
            Actstat.ST_INFO_NULL, // Actors.st_stand,

            [0, Sprites.SPR_HYPO1, 6, AI.T_Projectile, null, Actors.st_path2], // Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            [0, Sprites.SPR_HYPO2, 6, AI.T_Projectile, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_HYPO3, 6, AI.T_Projectile, null, Actors.st_path4], // Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            [0, Sprites.SPR_HYPO4, 6, AI.T_Projectile, null, Actors.st_path1], // Actors.st_path4,

            Actstat.ST_INFO_NULL,// Actors.st_pain,
            Actstat.ST_INFO_NULL,// Actors.st_pain1,

            Actstat.ST_INFO_NULL,// Actors.st_shoot1,
            Actstat.ST_INFO_NULL,// Actors.st_shoot2,
            Actstat.ST_INFO_NULL,// Actors.st_shoot3,
            Actstat.ST_INFO_NULL,//  Actors.st_shoot4,
            Actstat.ST_INFO_NULL,// Actors.st_shoot5,
            Actstat.ST_INFO_NULL,// Actors.st_shoot6,

            Actstat.ST_INFO_NULL,// Actors.st_shoot7,
            Actstat.ST_INFO_NULL,// Actors.st_shoot8,
            Actstat.ST_INFO_NULL,// Actors.st_shoot9,

            Actstat.ST_INFO_NULL,// Actors.st_chase1,
            Actstat.ST_INFO_NULL, // Actors.st_chase1s,
            Actstat.ST_INFO_NULL, // Actors.st_chase2,
            Actstat.ST_INFO_NULL,// Actors.st_chase3,
            Actstat.ST_INFO_NULL,     // Actors.st_chase3s,
            Actstat.ST_INFO_NULL, // Actors.st_chase4,

            Actstat.ST_INFO_NULL, // Actors.st_die1,
            Actstat.ST_INFO_NULL, // Actors.st_die2,
            Actstat.ST_INFO_NULL, // Actors.st_die3,
            Actstat.ST_INFO_NULL,// Actors.st_die4,
            Actstat.ST_INFO_NULL,// Actors.st_die5,

            Actstat.ST_INFO_NULL,// Actors.st_die6,
            Actstat.ST_INFO_NULL,// Actors.st_die7,
            Actstat.ST_INFO_NULL,// Actors.st_die8,
            Actstat.ST_INFO_NULL,// Actors.st_die9,

            Actstat.ST_INFO_NULL // Actors.st_dead
        ],
        // en_fire,
        [
            Actstat.ST_INFO_NULL, // Actors.st_stand,

            [0, Sprites.SPR_FIRE1, 6, null, AI.T_Projectile, Actors.st_path2], // Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            [0, Sprites.SPR_FIRE2, 6, null, AI.T_Projectile, Actors.st_path1], // Actors.st_path2,
            Actstat.ST_INFO_NULL, // Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            Actstat.ST_INFO_NULL, // Actors.st_path4,

            Actstat.ST_INFO_NULL,// Actors.st_pain,
            Actstat.ST_INFO_NULL,// Actors.st_pain1,

            Actstat.ST_INFO_NULL,// Actors.st_shoot1,
            Actstat.ST_INFO_NULL,// Actors.st_shoot2,
            Actstat.ST_INFO_NULL,// Actors.st_shoot3,
            Actstat.ST_INFO_NULL,//  Actors.st_shoot4,
            Actstat.ST_INFO_NULL,// Actors.st_shoot5,
            Actstat.ST_INFO_NULL,// Actors.st_shoot6,

            Actstat.ST_INFO_NULL,// Actors.st_shoot7,
            Actstat.ST_INFO_NULL,// Actors.st_shoot8,
            Actstat.ST_INFO_NULL,// Actors.st_shoot9,

            Actstat.ST_INFO_NULL,// Actors.st_chase1,
            Actstat.ST_INFO_NULL, // Actors.st_chase1s,
            Actstat.ST_INFO_NULL, // Actors.st_chase2,
            Actstat.ST_INFO_NULL,// Actors.st_chase3,
            Actstat.ST_INFO_NULL,     // Actors.st_chase3s,
            Actstat.ST_INFO_NULL, // Actors.st_chase4,

            Actstat.ST_INFO_NULL, // Actors.st_die1,
            Actstat.ST_INFO_NULL, // Actors.st_die2,
            Actstat.ST_INFO_NULL, // Actors.st_die3,
            Actstat.ST_INFO_NULL,// Actors.st_die4,
            Actstat.ST_INFO_NULL,// Actors.st_die5,

            Actstat.ST_INFO_NULL,// Actors.st_die6,
            Actstat.ST_INFO_NULL,// Actors.st_die7,
            Actstat.ST_INFO_NULL,// Actors.st_die8,
            Actstat.ST_INFO_NULL,// Actors.st_die9,

            Actstat.ST_INFO_NULL // Actors.st_dead
        ],
        // en_rocket,
        [
            [1, Sprites.SPR_ROCKET_1, 3, AI.T_Projectile, ActorAI.smoke, Actors.st_stand], // Actors.st_stand,

            Actstat.ST_INFO_NULL,// Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            Actstat.ST_INFO_NULL, // Actors.st_path2,
            Actstat.ST_INFO_NULL,// Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            Actstat.ST_INFO_NULL, // Actors.st_path4,

            Actstat.ST_INFO_NULL,// Actors.st_pain,
            Actstat.ST_INFO_NULL,// Actors.st_pain1,

            Actstat.ST_INFO_NULL,// Actors.st_shoot1,
            Actstat.ST_INFO_NULL,// Actors.st_shoot2,
            Actstat.ST_INFO_NULL,// Actors.st_shoot3,
            Actstat.ST_INFO_NULL,//  Actors.st_shoot4,
            Actstat.ST_INFO_NULL,// Actors.st_shoot5,
            Actstat.ST_INFO_NULL,// Actors.st_shoot6,

            Actstat.ST_INFO_NULL,// Actors.st_shoot7,
            Actstat.ST_INFO_NULL,// Actors.st_shoot8,
            Actstat.ST_INFO_NULL,// Actors.st_shoot9,

            Actstat.ST_INFO_NULL,// Actors.st_chase1,
            Actstat.ST_INFO_NULL, // Actors.st_chase1s,
            Actstat.ST_INFO_NULL, // Actors.st_chase2,
            Actstat.ST_INFO_NULL,// Actors.st_chase3,
            Actstat.ST_INFO_NULL,     // Actors.st_chase3s,
            Actstat.ST_INFO_NULL, // Actors.st_chase4,

            [0, Sprites.SPR_BOOM_1, 6, null, null, Actors.st_die2], // Actors.st_die1,
            [0, Sprites.SPR_BOOM_2, 6, null, null, Actors.st_die3], // Actors.st_die2,
            [0, Sprites.SPR_BOOM_3, 6, null, null, Actors.st_remove], // Actors.st_die3,
            Actstat.ST_INFO_NULL,// Actors.st_die4,
            Actstat.ST_INFO_NULL,// Actors.st_die5,

            Actstat.ST_INFO_NULL,// Actors.st_die6,
            Actstat.ST_INFO_NULL,// Actors.st_die7,
            Actstat.ST_INFO_NULL,// Actors.st_die8,
            Actstat.ST_INFO_NULL,// Actors.st_die9,

            Actstat.ST_INFO_NULL // Actors.st_dead
        ],
        // en_smoke,
        [
            Actstat.ST_INFO_NULL, // Actors.st_stand,

            Actstat.ST_INFO_NULL, // Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            Actstat.ST_INFO_NULL, // Actors.st_path2,
            Actstat.ST_INFO_NULL, // Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            Actstat.ST_INFO_NULL, // Actors.st_path4,

            Actstat.ST_INFO_NULL, // Actors.st_pain,
            Actstat.ST_INFO_NULL, // Actors.st_pain1,

            Actstat.ST_INFO_NULL, // Actors.st_shoot1,
            Actstat.ST_INFO_NULL, // Actors.st_shoot2,
            Actstat.ST_INFO_NULL, // Actors.st_shoot3,
            Actstat.ST_INFO_NULL, // Actors.st_shoot4,
            Actstat.ST_INFO_NULL, // Actors.st_shoot5,
            Actstat.ST_INFO_NULL, // Actors.st_shoot6,

            Actstat.ST_INFO_NULL, // Actors.st_shoot7,
            Actstat.ST_INFO_NULL, // Actors.st_shoot8,
            Actstat.ST_INFO_NULL, // Actors.st_shoot9,

            Actstat.ST_INFO_NULL, // Actors.st_chase1,
            Actstat.ST_INFO_NULL, // Actors.st_chase1s,
            Actstat.ST_INFO_NULL, // Actors.st_chase2,
            Actstat.ST_INFO_NULL, // Actors.st_chase3,
            Actstat.ST_INFO_NULL,    // Actors.st_chase3s,
            Actstat.ST_INFO_NULL, // Actors.st_chase4,

            [0, Sprites.SPR_SMOKE_1, 3, null, null, Actors.st_die2], // Actors.st_die1,
            [0, Sprites.SPR_SMOKE_2, 3, null, null, Actors.st_die3], // Actors.st_die2,
            [0, Sprites.SPR_SMOKE_3, 3, null, null, Actors.st_die4], // Actors.st_die3,
            [0, Sprites.SPR_SMOKE_4, 3, null, null, Actors.st_remove], // Actors.st_die4,
            Actstat.ST_INFO_NULL, // Actors.st_die5,

            Actstat.ST_INFO_NULL, // Actors.st_die6,
            Actstat.ST_INFO_NULL, // Actors.st_die7,
            Actstat.ST_INFO_NULL, // Actors.st_die8,
            Actstat.ST_INFO_NULL, // Actors.st_die9,

            Actstat.ST_INFO_NULL  // Actors.st_dead
        ],
        // en_bj,
        [
            Actstat.ST_INFO_NULL, // Actors.st_stand,

            [0, Sprites.SPR_BJ_W1, 12, AI.T_BJRun, null, Actors.st_path1s], // Actors.st_path1,
            [0, Sprites.SPR_BJ_W1, 3, null, null, Actors.st_path2], // Actors.st_path1s,
            [0, Sprites.SPR_BJ_W2, 8, AI.T_BJRun, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_BJ_W3, 12, AI.T_BJRun, null, Actors.st_path3s], // Actors.st_path3,
            [0, Sprites.SPR_BJ_W3, 3, null, null, Actors.st_path4], // Actors.st_path3s,
            [0, Sprites.SPR_BJ_W4, 8, AI.T_BJRun, null, Actors.st_path1], // Actors.st_path4,

            Actstat.ST_INFO_NULL, // Actors.st_pain,
            Actstat.ST_INFO_NULL, // Actors.st_pain1,

            [0, Sprites.SPR_BJ_JUMP1, 14, AI.T_BJJump, null, Actors.st_shoot2], // Actors.st_shoot1,
            [0, Sprites.SPR_BJ_JUMP2, 14, AI.T_BJJump, AI.T_BJYell, Actors.st_shoot3], // Actors.st_shoot2,
            [0, Sprites.SPR_BJ_JUMP3, 14, AI.T_BJJump, null, Actors.st_shoot4], // Actors.st_shoot3,
            [0, Sprites.SPR_BJ_JUMP4, 150, null, AI.T_BJDone, Actors.st_shoot4], // Actors.st_shoot4,
            Actstat.ST_INFO_NULL, // Actors.st_shoot5,
            Actstat.ST_INFO_NULL, // Actors.st_shoot6,

            Actstat.ST_INFO_NULL, // Actors.st_shoot7,
            Actstat.ST_INFO_NULL, // Actors.st_shoot8,
            Actstat.ST_INFO_NULL, // Actors.st_shoot9,

            Actstat.ST_INFO_NULL, // Actors.st_chase1,
            Actstat.ST_INFO_NULL, // Actors.st_chase1s,
            Actstat.ST_INFO_NULL, // Actors.st_chase2,
            Actstat.ST_INFO_NULL, // Actors.st_chase3,
            Actstat.ST_INFO_NULL,    // Actors.st_chase3s,
            Actstat.ST_INFO_NULL, // Actors.st_chase4,

            Actstat.ST_INFO_NULL, // Actors.st_die1,
            Actstat.ST_INFO_NULL, // Actors.st_die2,
            Actstat.ST_INFO_NULL, // Actors.st_die3,
            Actstat.ST_INFO_NULL, // Actors.st_die4,
            Actstat.ST_INFO_NULL, // Actors.st_die5,

            Actstat.ST_INFO_NULL, // Actors.st_die6,
            Actstat.ST_INFO_NULL, // Actors.st_die7,
            Actstat.ST_INFO_NULL, // Actors.st_die8,
            Actstat.ST_INFO_NULL, // Actors.st_die9,

            Actstat.ST_INFO_NULL  // Actors.st_dead
        ],

        // --- Spear of destiny!
        // en_spark,
        [
            Actstat.ST_INFO_NULL, // Actors.st_stand,

            [0, Sprites.SPR_SPARK1, 6, AI.T_Projectile, null, Actors.st_path2], // Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            [0, Sprites.SPR_SPARK2, 6, AI.T_Projectile, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_SPARK3, 6, AI.T_Projectile, null, Actors.st_path4], // Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            [0, Sprites.SPR_SPARK4, 6, AI.T_Projectile, null, Actors.st_path1], // Actors.st_path4,

            Actstat.ST_INFO_NULL,// Actors.st_pain,
            Actstat.ST_INFO_NULL,// Actors.st_pain1,

            Actstat.ST_INFO_NULL,// Actors.st_shoot1,
            Actstat.ST_INFO_NULL,// Actors.st_shoot2,
            Actstat.ST_INFO_NULL,// Actors.st_shoot3,
            Actstat.ST_INFO_NULL,//  Actors.st_shoot4,
            Actstat.ST_INFO_NULL,// Actors.st_shoot5,
            Actstat.ST_INFO_NULL,// Actors.st_shoot6,

            Actstat.ST_INFO_NULL,// Actors.st_shoot7,
            Actstat.ST_INFO_NULL,// Actors.st_shoot8,
            Actstat.ST_INFO_NULL,// Actors.st_shoot9,

            Actstat.ST_INFO_NULL,// Actors.st_chase1,
            Actstat.ST_INFO_NULL, // Actors.st_chase1s,
            Actstat.ST_INFO_NULL, // Actors.st_chase2,
            Actstat.ST_INFO_NULL,// Actors.st_chase3,
            Actstat.ST_INFO_NULL,     // Actors.st_chase3s,
            Actstat.ST_INFO_NULL, // Actors.st_chase4,

            Actstat.ST_INFO_NULL, // Actors.st_die1,
            Actstat.ST_INFO_NULL, // Actors.st_die2,
            Actstat.ST_INFO_NULL, // Actors.st_die3,
            Actstat.ST_INFO_NULL,// Actors.st_die4,
            Actstat.ST_INFO_NULL,// Actors.st_die5,

            Actstat.ST_INFO_NULL,// Actors.st_die6,
            Actstat.ST_INFO_NULL,// Actors.st_die7,
            Actstat.ST_INFO_NULL,// Actors.st_die8,
            Actstat.ST_INFO_NULL,// Actors.st_die9,

            Actstat.ST_INFO_NULL // Actors.st_dead
        ],
        // en_hrocket,
        [
            [1, Sprites.SPR_HROCKET_1, 3, AI.T_Projectile, ActorAI.smoke, Actors.st_stand], // Actors.st_stand,

            Actstat.ST_INFO_NULL,// Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            Actstat.ST_INFO_NULL, // Actors.st_path2,
            Actstat.ST_INFO_NULL,// Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            Actstat.ST_INFO_NULL, // Actors.st_path4,

            Actstat.ST_INFO_NULL,// Actors.st_pain,
            Actstat.ST_INFO_NULL,// Actors.st_pain1,

            Actstat.ST_INFO_NULL,// Actors.st_shoot1,
            Actstat.ST_INFO_NULL,// Actors.st_shoot2,
            Actstat.ST_INFO_NULL,// Actors.st_shoot3,
            Actstat.ST_INFO_NULL,//  Actors.st_shoot4,
            Actstat.ST_INFO_NULL,// Actors.st_shoot5,
            Actstat.ST_INFO_NULL,// Actors.st_shoot6,

            Actstat.ST_INFO_NULL,// Actors.st_shoot7,
            Actstat.ST_INFO_NULL,// Actors.st_shoot8,
            Actstat.ST_INFO_NULL,// Actors.st_shoot9,

            Actstat.ST_INFO_NULL,// Actors.st_chase1,
            Actstat.ST_INFO_NULL, // Actors.st_chase1s,
            Actstat.ST_INFO_NULL, // Actors.st_chase2,
            Actstat.ST_INFO_NULL,// Actors.st_chase3,
            Actstat.ST_INFO_NULL,     // Actors.st_chase3s,
            Actstat.ST_INFO_NULL, // Actors.st_chase4,

            [0, Sprites.SPR_HBOOM_1, 6, null, null, Actors.st_die2], // Actors.st_die1,
            [0, Sprites.SPR_HBOOM_2, 6, null, null, Actors.st_die3], // Actors.st_die2,
            [0, Sprites.SPR_HBOOM_3, 6, null, null, Actors.st_remove], // Actors.st_die3,
            Actstat.ST_INFO_NULL,// Actors.st_die4,
            Actstat.ST_INFO_NULL,// Actors.st_die5,

            Actstat.ST_INFO_NULL,// Actors.st_die6,
            Actstat.ST_INFO_NULL,// Actors.st_die7,
            Actstat.ST_INFO_NULL,// Actors.st_die8,
            Actstat.ST_INFO_NULL,// Actors.st_die9,

            Actstat.ST_INFO_NULL // Actors.st_dead
        ],
        // en_hsmoke,
        [
            Actstat.ST_INFO_NULL, // Actors.st_stand,

            Actstat.ST_INFO_NULL, // Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            Actstat.ST_INFO_NULL, // Actors.st_path2,
            Actstat.ST_INFO_NULL, // Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            Actstat.ST_INFO_NULL, // Actors.st_path4,

            Actstat.ST_INFO_NULL, // Actors.st_pain,
            Actstat.ST_INFO_NULL, // Actors.st_pain1,

            Actstat.ST_INFO_NULL, // Actors.st_shoot1,
            Actstat.ST_INFO_NULL, // Actors.st_shoot2,
            Actstat.ST_INFO_NULL, // Actors.st_shoot3,
            Actstat.ST_INFO_NULL, // Actors.st_shoot4,
            Actstat.ST_INFO_NULL, // Actors.st_shoot5,
            Actstat.ST_INFO_NULL, // Actors.st_shoot6,

            Actstat.ST_INFO_NULL, // Actors.st_shoot7,
            Actstat.ST_INFO_NULL, // Actors.st_shoot8,
            Actstat.ST_INFO_NULL, // Actors.st_shoot9,

            Actstat.ST_INFO_NULL, // Actors.st_chase1,
            Actstat.ST_INFO_NULL, // Actors.st_chase1s,
            Actstat.ST_INFO_NULL, // Actors.st_chase2,
            Actstat.ST_INFO_NULL, // Actors.st_chase3,
            Actstat.ST_INFO_NULL,    // Actors.st_chase3s,
            Actstat.ST_INFO_NULL, // Actors.st_chase4,

            [0, Sprites.SPR_HSMOKE_1, 3, null, null, Actors.st_die2], // Actors.st_die1,
            [0, Sprites.SPR_HSMOKE_2, 3, null, null, Actors.st_die3], // Actors.st_die2,
            [0, Sprites.SPR_HSMOKE_3, 3, null, null, Actors.st_die4], // Actors.st_die3,
            [0, Sprites.SPR_HSMOKE_4, 3, null, null, Actors.st_remove], // Actors.st_die4,
            Actstat.ST_INFO_NULL, // Actors.st_die5,

            Actstat.ST_INFO_NULL, // Actors.st_die6,
            Actstat.ST_INFO_NULL, // Actors.st_die7,
            Actstat.ST_INFO_NULL, // Actors.st_die8,
            Actstat.ST_INFO_NULL, // Actors.st_die9,

            Actstat.ST_INFO_NULL  // Actors.st_dead
        ],
        // en_spectre,
        [
            Actstat.ST_INFO_NULL, // Actors.st_stand,

            [0, Sprites.SPR_SPECTRE_W1, 10, AI.T_Stand, null, Actors.st_path2], // Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            [0, Sprites.SPR_SPECTRE_W2, 10, AI.T_Stand, null, Actors.st_path3], // Actors.st_path2,
            [0, Sprites.SPR_SPECTRE_W3, 10, AI.T_Stand, null, Actors.st_path4], // Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            [0, Sprites.SPR_SPECTRE_W4, 10, AI.T_Stand, null, Actors.st_path1], // Actors.st_path4,

            Actstat.ST_INFO_NULL, // Actors.st_pain,
            Actstat.ST_INFO_NULL, // Actors.st_pain1,

            Actstat.ST_INFO_NULL, // Actors.st_shoot1,
            Actstat.ST_INFO_NULL, // Actors.st_shoot2,
            Actstat.ST_INFO_NULL, // Actors.st_shoot3,
            Actstat.ST_INFO_NULL, // Actors.st_shoot4,
            Actstat.ST_INFO_NULL, // Actors.st_shoot5,
            Actstat.ST_INFO_NULL, // Actors.st_shoot6,

            Actstat.ST_INFO_NULL, // Actors.st_shoot7,
            Actstat.ST_INFO_NULL, // Actors.st_shoot8,
            Actstat.ST_INFO_NULL, // Actors.st_shoot9,

            [0, Sprites.SPR_SPECTRE_W1, 10, AI.T_Ghosts, null, Actors.st_chase2], // Actors.st_chase1,
            Actstat.ST_INFO_NULL, // Actors.st_chase1s,
            [0, Sprites.SPR_SPECTRE_W2, 10, AI.T_Ghosts, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_SPECTRE_W3, 10, AI.T_Ghosts, null, Actors.st_chase4], // Actors.st_chase3,
            Actstat.ST_INFO_NULL,    // Actors.st_chase3s,
            [0, Sprites.SPR_SPECTRE_W4, 10, AI.T_Ghosts, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_SPECTRE_F1, 10, null, null, Actors.st_die2], // Actors.st_die1,
            [0, Sprites.SPR_SPECTRE_F2, 10, null, null, Actors.st_die3], // Actors.st_die2,
            [0, Sprites.SPR_SPECTRE_F3, 10, null, null, Actors.st_die4], // Actors.st_die3,
            [0, Sprites.SPR_SPECTRE_F4, 300, null, null, Actors.st_die5], // Actors.st_die4,
            [0, Sprites.SPR_SPECTRE_F4, 10, null, ActorAI.dormant, Actors.st_die5], // Actors.st_die5,

            Actstat.ST_INFO_NULL, // Actors.st_die6,
            Actstat.ST_INFO_NULL, // Actors.st_die7,
            Actstat.ST_INFO_NULL, // Actors.st_die8,
            Actstat.ST_INFO_NULL, // Actors.st_die9,

            Actstat.ST_INFO_NULL  // Actors.st_dead
        ],
        // en_angel,
        [
            [0, Sprites.SPR_ANGEL_W1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            Actstat.ST_INFO_NULL, // Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            Actstat.ST_INFO_NULL, // Actors.st_path2,
            Actstat.ST_INFO_NULL, // Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            Actstat.ST_INFO_NULL, // Actors.st_path4,

            [0, Sprites.SPR_ANGEL_TIRED1, 40, null, ActorAI.breathing, Actors.st_pain1], // Actors.st_pain,
            [0, Sprites.SPR_ANGEL_TIRED2, 40, null, null, Actors.st_shoot4], // Actors.st_pain1,

            [0, Sprites.SPR_ANGEL_SHOOT1, 10, null, ActorAI.startAttack, Actors.st_shoot2], // Actors.st_shoot1,
            [0, Sprites.SPR_ANGEL_SHOOT2, 20, null, AI.T_Launch, Actors.st_shoot3], // Actors.st_shoot2,
            [0, Sprites.SPR_ANGEL_SHOOT1, 10, null, ActorAI.relaunch, Actors.st_shoot2], // Actors.st_shoot3,

            [0, Sprites.SPR_ANGEL_TIRED1, 40, null, ActorAI.breathing, Actors.st_shoot5], // Actors.st_shoot4,
            [0, Sprites.SPR_ANGEL_TIRED2, 40, null, null, Actors.st_shoot6], // Actors.st_shoot5,
            [0, Sprites.SPR_ANGEL_TIRED1, 40, null, ActorAI.breathing, Actors.st_shoot7], // Actors.st_shoot6,
            [0, Sprites.SPR_ANGEL_TIRED2, 40, null, null, Actors.st_shoot8], // Actors.st_shoot7,
            [0, Sprites.SPR_ANGEL_TIRED1, 40, null, ActorAI.breathing, Actors.st_chase1], // Actors.st_shoot8,
            Actstat.ST_INFO_NULL, // Actors.st_shoot9,

            [0, Sprites.SPR_ANGEL_W1, 10, AI.T_BossChase, null, Actors.st_chase1s], // Actors.st_chase1,
            [0, Sprites.SPR_ANGEL_W1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [0, Sprites.SPR_ANGEL_W2, 8, AI.T_BossChase, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_ANGEL_W3, 10, AI.T_BossChase, null, Actors.st_chase3s], // Actors.st_chase3,
            [0, Sprites.SPR_ANGEL_W3, 3, null, null, Actors.st_chase4],    // Actors.st_chase3s,
            [0, Sprites.SPR_ANGEL_W4, 8, AI.T_BossChase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_ANGEL_W1, 1, null, ActorAI.deathScream, Actors.st_die2], // Actors.st_die1,
            [0, Sprites.SPR_ANGEL_W1, 1, null, null, Actors.st_die3], // Actors.st_die2,
            [0, Sprites.SPR_ANGEL_DIE1, 10, null, ActorAI.slurpie, Actors.st_die4], // Actors.st_die3,
            [0, Sprites.SPR_ANGEL_DIE2, 10, null, null, Actors.st_die5], // Actors.st_die4,
            [0, Sprites.SPR_ANGEL_DIE3, 10, null, null, Actors.st_die6], // Actors.st_die5,
            [0, Sprites.SPR_ANGEL_DIE4, 10, null, null, Actors.st_die7], // Actors.st_die6,
            [0, Sprites.SPR_ANGEL_DIE5, 10, null, null, Actors.st_die8], // Actors.st_die7,
            [0, Sprites.SPR_ANGEL_DIE6, 10, null, null, Actors.st_die9], // Actors.st_die8,
            [0, Sprites.SPR_ANGEL_DIE7, 10, null, null, Actors.st_dead], // Actors.st_die9,

            [0, Sprites.SPR_ANGEL_DEAD, 130, null, ActorAI.victory, Actors.st_dead]  // Actors.st_dead
        ],
        // en_trans,
        [
            [0, Sprites.SPR_TRANS_W1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            Actstat.ST_INFO_NULL, // Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            Actstat.ST_INFO_NULL, // Actors.st_path2,
            Actstat.ST_INFO_NULL, // Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            Actstat.ST_INFO_NULL, // Actors.st_path4,

            Actstat.ST_INFO_NULL, // Actors.st_pain,
            Actstat.ST_INFO_NULL, // Actors.st_pain1,

            [0, Sprites.SPR_TRANS_SHOOT1, 30, null, null, Actors.st_shoot2], // Actors.st_shoot1,
            [0, Sprites.SPR_TRANS_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot3], // Actors.st_shoot2,
            [0, Sprites.SPR_TRANS_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot4], // Actors.st_shoot3,
            [0, Sprites.SPR_TRANS_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot5], // Actors.st_shoot4,
            [0, Sprites.SPR_TRANS_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot6], // Actors.st_shoot5,
            [0, Sprites.SPR_TRANS_SHOOT2, 10, null, AI.T_Shoot, Actors.st_shoot7], // Actors.st_shoot6,
            [0, Sprites.SPR_TRANS_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot8], // Actors.st_shoot7,
            [0, Sprites.SPR_TRANS_SHOOT1, 10, null, null, Actors.st_chase1], // Actors.st_shoot8,
            Actstat.ST_INFO_NULL, // Actors.st_shoot9,

            [0, Sprites.SPR_TRANS_W1, 10, AI.T_Chase, null, Actors.st_chase1s], // Actors.st_chase1,
            [0, Sprites.SPR_TRANS_W1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [0, Sprites.SPR_TRANS_W2, 8, AI.T_Chase, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_TRANS_W3, 10, AI.T_Chase, null, Actors.st_chase3s], // Actors.st_chase3,
            [0, Sprites.SPR_TRANS_W3, 3, null, null, Actors.st_chase4],    // Actors.st_chase3s,
            [0, Sprites.SPR_TRANS_W4, 8, AI.T_Chase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_TRANS_W1, 1, null, ActorAI.deathScream, Actors.st_die2], // Actors.st_die1,
            [0, Sprites.SPR_TRANS_W1, 1, null, null, Actors.st_die3], // Actors.st_die2,
            [0, Sprites.SPR_TRANS_DIE1, 15, null, null, Actors.st_die4], // Actors.st_die3,
            [0, Sprites.SPR_TRANS_DIE2, 15, null, null, Actors.st_die5], // Actors.st_die4,
            [0, Sprites.SPR_TRANS_DIE3, 15, null, null, Actors.st_dead], // Actors.st_die5,
            Actstat.ST_INFO_NULL, // Actors.st_die6,
            Actstat.ST_INFO_NULL, // Actors.st_die7,
            Actstat.ST_INFO_NULL, // Actors.st_die8,
            Actstat.ST_INFO_NULL, // Actors.st_die9,

            [0, Sprites.SPR_TRANS_DEAD, 0, null, null, Actors.st_dead]  // Actors.st_dead
        ],
        // en_uber,
        [
            [0, Sprites.SPR_UBER_W1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            Actstat.ST_INFO_NULL, // Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            Actstat.ST_INFO_NULL, // Actors.st_path2,
            Actstat.ST_INFO_NULL, // Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            Actstat.ST_INFO_NULL, // Actors.st_path4,

            Actstat.ST_INFO_NULL, // Actors.st_pain,
            Actstat.ST_INFO_NULL, // Actors.st_pain1,

            [0, Sprites.SPR_UBER_SHOOT1, 30, null, null, Actors.st_shoot2], // Actors.st_shoot1,
            [0, Sprites.SPR_UBER_SHOOT2, 12, null, AI.T_UShoot, Actors.st_shoot3], // Actors.st_shoot2,
            [0, Sprites.SPR_UBER_SHOOT3, 12, null, AI.T_UShoot, Actors.st_shoot4], // Actors.st_shoot3,
            [0, Sprites.SPR_UBER_SHOOT4, 12, null, AI.T_UShoot, Actors.st_shoot5], // Actors.st_shoot4,
            [0, Sprites.SPR_UBER_SHOOT3, 12, null, AI.T_UShoot, Actors.st_shoot6], // Actors.st_shoot5,
            [0, Sprites.SPR_UBER_SHOOT2, 12, null, AI.T_UShoot, Actors.st_shoot7], // Actors.st_shoot6,
            [0, Sprites.SPR_UBER_SHOOT1, 12, null, null, Actors.st_chase1], // Actors.st_shoot7,
            Actstat.ST_INFO_NULL, // Actors.st_shoot8,
            Actstat.ST_INFO_NULL, // Actors.st_shoot9,

            [0, Sprites.SPR_UBER_W1, 10, AI.T_Chase, null, Actors.st_chase1s], // Actors.st_chase1,
            [0, Sprites.SPR_UBER_W1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [0, Sprites.SPR_UBER_W2, 8, AI.T_Chase, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_UBER_W3, 10, AI.T_Chase, null, Actors.st_chase3s], // Actors.st_chase3,
            [0, Sprites.SPR_UBER_W3, 3, null, null, Actors.st_chase4],    // Actors.st_chase3s,
            [0, Sprites.SPR_UBER_W4, 8, AI.T_Chase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_UBER_W1, 1, null, ActorAI.deathScream, Actors.st_die2], // Actors.st_die1,
            [0, Sprites.SPR_UBER_W1, 1, null, null, Actors.st_die3], // Actors.st_die2,
            [0, Sprites.SPR_UBER_DIE1, 15, null, null, Actors.st_die4], // Actors.st_die3,
            [0, Sprites.SPR_UBER_DIE2, 15, null, null, Actors.st_die5], // Actors.st_die4,
            [0, Sprites.SPR_UBER_DIE3, 15, null, null, Actors.st_die6], // Actors.st_die5,
            [0, Sprites.SPR_UBER_DIE4, 15, null, null, Actors.st_dead], // Actors.st_die6,
            Actstat.ST_INFO_NULL, // Actors.st_die7,
            Actstat.ST_INFO_NULL, // Actors.st_die8,
            Actstat.ST_INFO_NULL, // Actors.st_die9,

            [0, Sprites.SPR_UBER_DEAD, 0, null, null, Actors.st_dead]  // Actors.st_dead
        ],
        // en_will,
        [
            [0, Sprites.SPR_WILL_W1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            Actstat.ST_INFO_NULL, // Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            Actstat.ST_INFO_NULL, // Actors.st_path2,
            Actstat.ST_INFO_NULL, // Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            Actstat.ST_INFO_NULL, // Actors.st_path4,

            Actstat.ST_INFO_NULL, // Actors.st_pain,
            Actstat.ST_INFO_NULL, // Actors.st_pain1,

            [0, Sprites.SPR_WILL_SHOOT1, 30, null, null, Actors.st_shoot2], // Actors.st_shoot1,
            [0, Sprites.SPR_WILL_SHOOT2, 10, null, AI.T_Launch, Actors.st_shoot3], // Actors.st_shoot2,
            [0, Sprites.SPR_WILL_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot4], // Actors.st_shoot3,
            [0, Sprites.SPR_WILL_SHOOT4, 10, null, AI.T_Shoot, Actors.st_shoot5], // Actors.st_shoot4,
            [0, Sprites.SPR_WILL_SHOOT3, 10, null, AI.T_Shoot, Actors.st_shoot6], // Actors.st_shoot5,
            [0, Sprites.SPR_WILL_SHOOT4, 10, null, AI.T_Shoot, Actors.st_chase1], // Actors.st_shoot6,
            Actstat.ST_INFO_NULL, // Actors.st_shoot7,
            Actstat.ST_INFO_NULL, // Actors.st_shoot8,
            Actstat.ST_INFO_NULL, // Actors.st_shoot9,

            [0, Sprites.SPR_WILL_W1, 10, AI.T_BossChase, null, Actors.st_chase1s], // Actors.st_chase1,
            [0, Sprites.SPR_WILL_W1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [0, Sprites.SPR_WILL_W2, 8, AI.T_BossChase, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_WILL_W3, 10, AI.T_BossChase, null, Actors.st_chase3s], // Actors.st_chase3,
            [0, Sprites.SPR_WILL_W3, 3, null, null, Actors.st_chase4],    // Actors.st_chase3s,
            [0, Sprites.SPR_WILL_W4, 8, AI.T_BossChase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_WILL_W1, 1, null, ActorAI.deathScream, Actors.st_die2], // Actors.st_die1,
            [0, Sprites.SPR_WILL_W1, 10, null, null, Actors.st_die3], // Actors.st_die2,
            [0, Sprites.SPR_WILL_DIE1, 10, null, null, Actors.st_die4], // Actors.st_die3,
            [0, Sprites.SPR_WILL_DIE2, 10, null, null, Actors.st_die5], // Actors.st_die4,
            [0, Sprites.SPR_WILL_DIE3, 10, null, null, Actors.st_dead], // Actors.st_die5,
            Actstat.ST_INFO_NULL, // Actors.st_die6,
            Actstat.ST_INFO_NULL, // Actors.st_die7,
            Actstat.ST_INFO_NULL, // Actors.st_die8,
            Actstat.ST_INFO_NULL, // Actors.st_die9,

            [0, Sprites.SPR_WILL_DEAD, 20, null, null, Actors.st_dead]  // Actors.st_dead
        ],
        // en_death
        [
            [0, Sprites.SPR_DEATH_W1, 0, AI.T_Stand, null, Actors.st_stand], // Actors.st_stand,

            Actstat.ST_INFO_NULL, // Actors.st_path1,
            Actstat.ST_INFO_NULL, // Actors.st_path1s,
            Actstat.ST_INFO_NULL, // Actors.st_path2,
            Actstat.ST_INFO_NULL, // Actors.st_path3,
            Actstat.ST_INFO_NULL, // Actors.st_path3s,
            Actstat.ST_INFO_NULL, // Actors.st_path4,

            Actstat.ST_INFO_NULL, // Actors.st_pain,
            Actstat.ST_INFO_NULL, // Actors.st_pain1,

            [0, Sprites.SPR_DEATH_SHOOT1, 30, null, null, Actors.st_shoot2], // Actors.st_shoot1,
            [0, Sprites.SPR_DEATH_SHOOT2, 10, null, AI.T_Launch, Actors.st_shoot3], // Actors.st_shoot2,
            [0, Sprites.SPR_DEATH_SHOOT4, 10, null, AI.T_Shoot, Actors.st_shoot4], // Actors.st_shoot3,
            [0, Sprites.SPR_DEATH_SHOOT3, 10, null, AI.T_Launch, Actors.st_shoot5], // Actors.st_shoot4,
            [0, Sprites.SPR_DEATH_SHOOT4, 10, null, AI.T_Shoot, Actors.st_chase1], // Actors.st_shoot5,
            Actstat.ST_INFO_NULL, // Actors.st_shoot6,
            Actstat.ST_INFO_NULL, // Actors.st_shoot7,
            Actstat.ST_INFO_NULL, // Actors.st_shoot8,
            Actstat.ST_INFO_NULL, // Actors.st_shoot9,

            [0, Sprites.SPR_DEATH_W1, 10, AI.T_BossChase, null, Actors.st_chase1s], // Actors.st_chase1,
            [0, Sprites.SPR_DEATH_W1, 3, null, null, Actors.st_chase2], // Actors.st_chase1s,
            [0, Sprites.SPR_DEATH_W2, 8, AI.T_BossChase, null, Actors.st_chase3], // Actors.st_chase2,
            [0, Sprites.SPR_DEATH_W3, 10, AI.T_BossChase, null, Actors.st_chase3s], // Actors.st_chase3,
            [0, Sprites.SPR_DEATH_W3, 3, null, null, Actors.st_chase4],    // Actors.st_chase3s,
            [0, Sprites.SPR_DEATH_W4, 8, AI.T_BossChase, null, Actors.st_chase1], // Actors.st_chase4,

            [0, Sprites.SPR_DEATH_W1, 1, null, ActorAI.deathScream, Actors.st_die2], // Actors.st_die1,
            [0, Sprites.SPR_DEATH_W1, 10, null, null, Actors.st_die3], // Actors.st_die2,
            [0, Sprites.SPR_DEATH_DIE1, 10, null, null, Actors.st_die4], // Actors.st_die3,
            [0, Sprites.SPR_DEATH_DIE2, 10, null, null, Actors.st_die5], // Actors.st_die4,
            [0, Sprites.SPR_DEATH_DIE3, 10, null, null, Actors.st_die6], // Actors.st_die5,
            [0, Sprites.SPR_DEATH_DIE4, 10, null, null, Actors.st_die7], // Actors.st_die6,
            [0, Sprites.SPR_DEATH_DIE5, 10, null, null, Actors.st_die7], // Actors.st_die7,
            [0, Sprites.SPR_DEATH_DIE6, 10, null, null, Actors.st_die7], // Actors.st_die8,
            Actstat.ST_INFO_NULL, // Actors.st_die9,

            [0, Sprites.SPR_DEATH_DEAD, 0, null, null, Actors.st_dead]  // Actors.st_dead
        ]
    ];

    // int    starthitpoints[ 4 ][ NUMENEMIES ] =
    static starthitpoints = [
        //
        // BABY MODE
        //
        [
            25,     // guards
            50,     // officer
            100,    // SS
            1,      // dogs
            850,    // Hans
            850,    // Schabbs
            200,    // fake hitler
            800,    // mecha hitler
            500,    // hitler
            45,     // mutants
            25,     // ghosts
            25,     // ghosts
            25,     // ghosts
            25,     // ghosts

            850,    // Gretel
            850,    // Gift
            850,    // Fat
            // --- Projectiles
            0,      // en_needle,
            0,      // en_fire,
            0,      // en_rocket,
            0,      // en_smoke,
            100,    // en_bj,
            // --- Spear of destiny!
            0,      // en_spark,
            0,      // en_hrocket,
            0,      // en_hsmoke,

            5,      // en_spectre,
            1450,   // en_angel,
            850,    // en_trans,
            1050,   // en_uber,
            950,    // en_will,
            1250    // en_death
        ],

        //
        // DON'T HURT ME MODE
        //
        [
            25,     // guards
            50,     // officer
            100,    // SS
            1,      // dogs
            950,    // Hans
            950,    // Schabbs
            300,    // fake hitler
            950,    // mecha hitler
            700,    // hitler
            55,     // mutants
            25,     // ghosts
            25,     // ghosts
            25,     // ghosts
            25,     // ghosts

            950,    // Gretel
            950,    // Gift
            950,    // Fat
            // --- Projectiles
            0,      // en_needle,
            0,      // en_fire,
            0,      // en_rocket,
            0,      // en_smoke,
            100,    // en_bj,
            // --- Spear of destiny!
            0,      // en_spark,
            0,      // en_hrocket,
            0,      // en_hsmoke,

            10,     // en_spectre,
            1550,   // en_angel,
            950,    // en_trans,
            1150,   // en_uber,
            1050,   // en_will,
            1350    // en_death
        ],

        //
        // BRING 'EM ON MODE
        //
        [
            25,     // guards
            50,     // officer
            100,    // SS
            1,      // dogs

            1050,   // Hans
            1550,   // Schabbs
            400,    // fake hitler
            1050,   // mecha hitler
            800,    // hitler

            55,     // mutants
            25,     // ghosts
            25,     // ghosts
            25,     // ghosts
            25,     // ghosts

            1050,   // Gretel
            1050,   // Gift
            1050,   // Fat
            // --- Projectiles
            0,      // en_needle,
            0,      // en_fire,
            0,      // en_rocket,
            0,      // en_smoke,
            100,    // en_bj,
            // --- Spear of destiny!
            0,      // en_spark,
            0,      // en_hrocket,
            0,      // en_hsmoke,

            15,     // en_spectre,
            1650,   // en_angel,
            1050,   // en_trans,
            1250,   // en_uber,
            1150,   // en_will,
            1450    // en_death
        ],

        //
        // DEATH INCARNATE MODE
        //
        [
            25,     // guards
            50,     // officer
            100,    // SS
            1,      // dogs

            1200,   // Hans
            2400,   // Schabbs
            500,    // fake hitler
            1200,   // mecha hitler
            900,    // hitler

            65,     // mutants
            25,     // ghosts
            25,     // ghosts
            25,     // ghosts
            25,     // ghosts

            1200,   // Gretel
            1200,   // Gift
            1200,   // Fat
            // --- Projectiles
            0,      // en_needle,
            0,      // en_fire,
            0,      // en_rocket,
            0,      // en_smoke,
            100,    // en_bj,
            // --- Spear of destiny!
            0,      // en_spark,
            0,      // en_hrocket,
            0,      // en_hsmoke,

            25,     // en_spectre,
            2000,   // en_angel,
            1200,   // en_trans,
            1400,   // en_uber,
            1300,   // en_will,
            1600    // en_death
        ]
    ];

    static init() {
        /*
        typedef struct
        {
            char rotate; // 1-if object can be rotated, 0 if one sprite for every direction
            int texture; // base object's state texture if rotation is on facing player
            int timeout; // after how man ticks change state to .next_state
            think_t think; // what to do every frame
            think_t action; // what to do once per state
            en_state next_state; // next state
        }
        */

        // convert to state structs
        for (let i = 0; i < Actstat.objstate.length; i++) {
            let obj = Actstat.objstate[i];

            for (let j = 0; j < obj.length; j++) {
                let state = obj[j];

                obj[j] = {
                    rotate: state[0],
                    texture: state[1],
                    timeout: state[2],
                    think: state[3],
                    action: state[4],
                    next_state: state[5]
                };
            }
        }
    }
}

Actstat.init();
