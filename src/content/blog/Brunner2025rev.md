---
title: "BrunnerCTF 2025 trippa troppa sus reverse challenge"
date: 2025-08-26
tags: ["ctf", "tutorial", "reverse"]
description: ""
---

hello hackers today i will share my writeup for the challenge trippa troppa sus from brunner ctf\
this is a reverse engineering challenge with a python script that is written in a very obfuscated way using meme names and deep nested functions

understanding the challenge
===========================

the given python file is called `trippa_troppa_sus.py`
```
#!/usr/bin/env python3\
import sys as _tralalero_tralala_impostor_____\
(lambda _bombardiro_crocodilo___: [\
    setattr(__builtins__, '__boneca_ambalabu_toilet____', __import__('base64').b85encode),\
    setattr(__builtins__, '___trippa_troppa_mewing___', __import__('hashlib').sha256),\
    setattr(__builtins__, '__tung_tung_sahur_cycle_____', __import__('itertools').cycle),\
    setattr(__builtins__, '____pinguino_arrabiato_seed____', __import__('random').seed)\
][_bombardiro_crocodilo___] and None)(0) or ____pinguino_arrabiato_seed____(69420)

def ___ranocchio_turbina_function_factory____():\
    def ____lirilì_rilà_final_boss_____():\
        def _____trippi_troppa_skibidi_____():\
            def ______crocodina_gigachad_nested______():\
                def _______tralala_alpha_transformation_______():\
                    def ________boneca_beta_elimination________():\
                        def _________sahur_sigma_activities_________():\
                            def __________bombardiro_mewing__________():\
                                def ___________trippa_no_cap___________():\
                                    def ____________tung_bussin_respectfully____________():\
                                        def _____________tralalero_slay_queen_energy_____________():\
                                            __fanum_tax_pinguino____ = lambda ___cringe_normie_bombardiro___, ____based_chad_crocodilo____: (lambda ____uwu_owo_tralalero____: [__c__ for __c__ in ____uwu_owo_tralalero____])(\
                                                [___x___ ^ ___y___ for ___x___, ___y___ in zip(___cringe_normie_bombardiro___, __tung_tung_sahur_cycle_____(____based_chad_crocodilo____))]\
                                            )

                                            def ____boneca_ambalabu_university____(___x_trippa___, ___y_troppa___):\
                                                return (lambda ____bruh_moment_lirilì____: ____bruh_moment_lirilì____.digest()[:len(___y_troppa___)])(\
                                                    ___trippa_troppa_mewing___(\
                                                        ((___x_trippa___.decode() if isinstance(___x_trippa___, bytes) else ___x_trippa___) +\
                                                         (___y_troppa___.decode() if isinstance(___y_troppa___, bytes) else ___y_troppa___)).encode()\
                                                    )\
                                                )

                                            def ____tralalero_griddy_dance____(___x_ranocchio___):\
                                                return (lambda ____fortnite_bombardiro_pass____:\
                                                       [___c_crocodina___ for ___c_crocodina___ in ____fortnite_bombardiro_pass____]\
                                                )([((___c_sahur___ * 7) % 256) for ___c_sahur___ in ___x_ranocchio___])

                                            def ____tung_reverse_uno_card____(___x_pinguino___):\
                                                return (lambda ____amogus_sus_trippi____: ____amogus_sus_trippi____[::-1])(___x_pinguino___)

                                            def ____dead_meme_boneca_graveyard____():\
                                                ____poggers_tralala____, ____chungus_rilà____, ____keanu_troppa____ = 1337, 420, 9000\
                                                for ___i_bombardiro___ in (lambda ___x_crocodilo___: range(___x_crocodilo___))(5):\
                                                    ____poggers_tralala____ = (____poggers_tralala____ * ____chungus_rilà____ + ____keanu_troppa____) % (___i_bombardiro___ + 7)\
                                                return ____poggers_tralala____

                                            def ____touch_grass_tralalero_function____():\
                                                try:\
                                                    with open("flag.txt", "rb") as ____yeet_file_ambalabu____:\
                                                        ____cringe_flag_pinguino____ = ____yeet_file_ambalabu____.read()\
                                                except:\
                                                    return "L + ratio + skill issue + no tralalero for you"

                                                ____sussy_key_bombardiro____ = b"skibidi"

                                                ____step_one_boneca____ = ____boneca_ambalabu_university____(____sussy_key_bombardiro____, ____sussy_key_bombardiro____)\
                                                ____step_two_sahur____ = bytes(__fanum_tax_pinguino____(____cringe_flag_pinguino____, ____step_one_boneca____))\
                                                ____step_three_trippa____ = bytes(____tralalero_griddy_dance____(____step_two_sahur____))\
                                                ____step_four_troppa____ = ____tung_reverse_uno_card____(____step_three_trippa____)\
                                                ____final_boss_crocodina____ = __boneca_ambalabu_toilet____(____step_four_troppa____).decode()

                                                return ____final_boss_crocodina____

                                            return ____touch_grass_tralalero_function____\
                                        return _____________tralalero_slay_queen_energy_____________\
                                    return ____________tung_bussin_respectfully____________\
                                return ___________trippa_no_cap___________\
                            return __________bombardiro_mewing__________\
                        return _________sahur_sigma_activities_________\
                    return ________boneca_beta_elimination________\
                return _______tralala_alpha_transformation_______\
            return ______crocodina_gigachad_nested______\
        return _____trippi_troppa_skibidi_____\
    return ____lirilì_rilà_final_boss_____

if __name__ == "__main__":\
    print((lambda ___x_tralalero___: ___x_tralalero___()()()()()()()()()()()())(___ranocchio_turbina_function_factory____))\
at first it looks very confusing because it has more than ten levels of nested functions and many meme variable names\
 but if we ignore the noise and focus on what the code does we can see the following main steps
```
1 the program reads the file `flag.txt`\
2 it defines a key `skibidi`\
3 it builds a smaller key from sha256 of the string `skibidiskibidi` and cuts it to the length of `skibidi` which is 7 bytes\
4 it xors the flag with this key using itertools cycle\
5 it multiplies every byte of the result by 7 mod 256\
6 it reverses the order of the bytes\
7 it base85 encodes the final bytes and prints it

we are given the base85 output in a file called `output.txt` so our job is to reverse all these steps in the opposite order

building the decoder
====================

to solve this we do the following steps

1 base85 decode the string from outputtxt\
2 reverse the bytes back to the original order\
3 undo the multiplication by 7 this is done using the modular inverse of 7 modulo 256 the inverse is 183 because 7 multiplied by 183 is congruent to 1 mod 256 so we multiply every byte by 183 mod 256\
4 xor the result again with the same sha256 key to undo the previous xor step\
5 what we get after this should be the flag in plain ascii

the decoder code
================

import base64\
import hashlib\
import itertools

# read the encoded string\
with open("output.txt", "r") as f:\
    data = f.read().strip()\
# step 1 base85 decode\
decoded = base64.b85decode(data)\
# step 2 reverse\
rev = decoded[::-1]\
# step 3 undo multiply by 7\
inv7 = 183\
step3 = bytes((c * inv7) % 256 for c in rev)\
# step 4 build the key\
key = hashlib.sha256(b"skibidiskibidi").digest()[:len(b"skibidi")]\
# step 5 xor with the key\
flag = bytes(c ^ k for c, k in zip(step3, itertools.cycle(key)))\
print(flag.decode())

explanation of the code
=======================

we import base64 hashlib itertools because we need them for base85 decoding for sha256 and for cycling the xor key

`data = base64.b85decode(data)` undoes the base85 encoding from the original script

`rev = decoded[::-1]` undoes the reverse step

`inv7 = 183` this number is important it is the modular inverse of 7 modulo 256 it allows us to undo the multiplication that the original script applied

`key = hashlib.sha256(b"skibidiskibidi").digest()[:7]` builds the same key used in the encoder because the word skibidi is 7 bytes we cut the digest to 7 bytes

`flag = bytes(c ^ k for c k in zip(step3 itertools.cycle(key)))` xors the bytes with the key again which cancels out the first xor

the final print gives the clear flag

result
======

running the script gives us the flag

`brunner{tr4l4l3r0_b0mb4rd1r0_r3v3rs3_3ng1n33r1ng_sk1b1d1_m4st3r}`

Conclusion
==========

this challenge looks scary at first because of the obfuscated python but once we carefully track what each function does we see a clear sequence of transformations all of which can be reversed with some math and with careful use of python libraries

Happy hacking
