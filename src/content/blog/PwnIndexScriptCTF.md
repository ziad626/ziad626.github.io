---
title: "ScriptCTF Pwn: Index"
date: 2025-08-26
tags: ["ctf", "tutorial", "binary exploitation", "pwn", "exploit development"]
description: ""
---

# Index CTF Pwn Challenge Writeup: Stealing the Flag That’s Basically Waving at You

Hello hackers, the “Index” challenge a classic pwnable where the binary hands you the flag on a silver platter but then slaps a “No Touching” sign on it. Or so it thinks. We’re about to dive deep into this binary, peeling back the layers like an onion that makes you cry tears of assembly code. We’ll uncover the vulnerability, explain what’s happening under the hood at the machine level, and walk through the exploitation step by step. Buckle up; this is gonna be a chill ride with some tech-heavy detours, a few sneaky laughs, and zero spoilers on why the flag feels like it’s locally yours.

## Step 1: Recon — Running the Binary and Sniffing Around

First things first, we fire up the binary **./index**. It’s a menu-driven program, because what pwn challenge isn’t secretly a restaurant where the specials are buffer overflows and index crimes?

The menu:

* Store data
* Read data
* Print flag
* Exit

Looks innocent. **Store** lets you pick an index and input some data (up to 7 chars + null, but we’ll get to that). **Read** lets you pick an index and spits back what’s there. **Print flag**? Asks for a password and mocks you if wrong. **Exit**? Well, exits.

But in the provided interaction, someone inputs **1337** first — not on the menu, but the program doesn’t crash or complain. Then reads index **8** and boom: **Data: flag{localy}**. That’s no coincidence; that’s a leak screaming “exploit me!” Why **1337**? Why index **8**? Why does the flag look like it’s hiding in plain sight? Time to **gdb** this bad boy and disassemble.

## Step 2: Disassembly Deep Dive — What’s Under the Hood?

We load it in **gdb** (with **pwndbg** for that extra flair). **Functions** gives us the layout. Key players: **main**, **store_data**, **read_data**, **print_flag**, and some globals like **nums** at **0x4060** and **flag** at **0x40a0**.

### Main Function: The Menu Loop with a Secret Sauce

Disassembling **main** (at **0x1427**):

* Sets up stack frame, canary for stack smashing protection (**__stack_chk_fail** calls hint at it).
* Calls **init** (probably sets up **stdout** buffering with **setbuf**).
* Enters loop: Calls **menu** to print options.
* **fgets** user input into a **0x64**-byte buffer on stack.
* **atoi** to get choice.
* If choice between **1–4**, jump table via computed goto (classic switch in asm: load offset from table at **0x20d4**, add to base, **jmp**).
    * **1**: **store_data**
    * **2**: **read_data**
    * **3**: **print_flag**
    * **4**: Puts “Bye!” and exits.
* If not **1–4**, checks if choice == **0x539** (that’s **1337** in decimal — elite hacker nod, because nothing says “secret” like leetspeak).
    * If yes: **fopen(“flag.txt”, “r”)**, stores **FILE*** in global **f** at **0x40e0**.
    * Then **fgets 0x40** bytes from file into global **flag** buffer at **0x40a0**.
    * No output, just loads it silently. Like the binary’s saying, “Here’s the flag, but good luck using it without my permission.”
* Else, if invalid, loops back quietly. No error message — lazy dev or intentional troll?

Under the hood: The jump table is an array of offsets, indexed by **choice*4**. Asm: **mov eax,[rbp-0x74]** (choice), **lea rdx,[rax*4+0x0]**, load from table, **cdqe** for sign extend, add base, **jmp**. If out of bounds, it just falls through to loop — no segfault, because no check.

Globals layout is key here: **nums** at **0x4060**, **flag** at **0x40a0**. Difference: **0x40** bytes. So **nums** is a **64**-byte buffer (**0x40** hex). Why **64**? Because operations treat it as **8** slots of **8** bytes each (**index * 8**).

### Store Data: Writing Without Borders

Disas **store_data** (at **0x124f**):

* Stack setup, canary.
* **printf(“Index: “)**
* **scanf(“%d”, &index)**
* **getchar()** to eat newline (**scanf** leaves it).
* **printf(“Data: “)**
* Compute address: **rdx = index**, **rcx = rdx*8**, **rcx += 0x4060** (**nums** base).
* **fgets(target_addr, 0x8, stdin)** — reads up to **7** chars + null.
* No bounds check on index! You can input negative (underflow, hello stack/heap antics) or large (oob write). It treats **nums** as a flat char array, slotted in **8**-byte chunks. Writing **8** bytes? Because **fgets** includes null, so short strings.

Under the hood: **lea rcx,[rdx*8+0x0]**, **lea rdx,[rip+0x2d96]** (**nums**), **add rcx,rdx**. Pointer arithmetic in asm — no array bounds, just raw math. If **index=8**, target=**0x4060 + 64 = 0x40a0**… that’s the **flag** buffer! But **store** writes, so you could overwrite the flag if loaded.

### Read Data: The Leaky Faucet

Disas **read_data** (at **0x12f4**):

* Similar: **printf(“Index: “)**, **scanf(“%d”)**, **getchar()**.
* Compute addr same way: **rax = index*8 + 0x4060**
* **printf(“Data: %s\n”, addr)**
* Again, no bounds! **%s** prints until null. If you read oob, it leaks whatever’s there.

Under the hood: Same pointer calc. If **index=8**, prints from **0x40a0** (**flag**). And since **flag** is loaded via secret menu and null-terminated (**fgets**), it dumps the flag. Boom — the “localy” in the interaction? Probably a fake flag, but in real CTF, that’s the real one. Like the binary’s whispering, “I hid it locally, bro, just index it.”

### Print Flag: The Troll Gatekeeper

Disas **print_flag** (at **0x1361**):

* Stack buf **0x50**, canary.
* **puts(“Enter password:”)**
* **fgets(buf, 0x40, stdin)**
* **strcmp(buf, some_string_at_0x206a)** — probably “super_secure_password\n” or whatever hardcoded.
* If match, **puts(string_at_0x2070)** — maybe “Here is your flag: “ but wait, no **%s**, just puts a fixed string. No actual flag print!
* Else **strcmp(buf, another_at_0x209e)**, **puts(another_at_0x20a2)** — probably decoy messages.
* Else **printf(“Wrong password: %s\n”, buf)** — echoes your fail.

Under the hood: **strcmp** is byte-by-byte compare until diff or null. Hardcoded passwords in **.rodata**. But crucially, it NEVER prints the loaded flag from **0x40a0**. It’s a red herring! The dev’s like, “Psych! You thought printing flag meant printing the flag? Nah, just some lame strings.” The real way to “print” is via **read**’s leak.

Vuln summary: Array index out-of-bounds (OOB) in **store**/**read**. No checks mean arbitrary read/write (within address space limits). Specifically, **nums** [64 bytes], **flag** right after. Index **>=8** writes/reads into **flag** or beyond. Classic adjacent memory leak/overwrite. Stack canary protects overflows, but OOB is pointer-based, no smash needed.

Why no bounds? Dev forgot or intentional for CTF. In C, it’d be like **char nums[64]; fgets(&nums[index*8], 8, stdin);** — no **if(index < 8)**. Under the hood, CPU doesn’t care; it just adds offsets. If address valid (in process mem), no segfault. Here, globals are contiguous in **.bss**.

## Step 3: The Vulnerability — OOB Read for the Win

The core vuln: Unbounded index in **read**/**store**. **nums** is **64** bytes (**8** slots * **8** bytes). Index **0–7**: safe. Index **8**: **&nums[64] == flag[0]**.

But **flag** buffer empty until loaded. That’s where **1337** comes in — the “secret” menu loads **flag.txt** into **flag** buffer. Then **read** index **8** leaks it.

Why “literally handed to you”? Because **1337** loads it — the binary gives it to you in memory. But “steal it”? **Print_flag** won’t cough it up without password (which we don’t have/know). So exploit OOB to steal via **read**.

Funny thing: Imagine the dev giggling, “They’ll brute the password forever while the flag’s just an index away.” But we’re smarter — we “index” our way to victory.

Under the hood risks: Large index could hit unmapped pages (segfault). Negative: wrap around to high addresses (**uint** underflow? But index **int**, so negative offsets into before **nums**, maybe code/data). But we don’t need; **8** is perfect.

## Step 4: Exploitation Step by Step — Chill Mode

1.  **Load the Flag**: Input **1337** at menu. This triggers **fopen**/**fgets** into **flag** buffer. No output, but now **0x40a0** holds the goods. Under the hood: **fopen** allocates **FILE***, **fgets** reads up to **63** + null from file. File closed? Nope, but doesn’t matter.
2.  **OOB Read**: Choose **2** (**read**). Input index **8**. **printf %s** from **0x40a0** — dumps flag until null.

That’s it. In interaction: Did exactly that, got **flag{localy}**. In real remote CTF, connect, do same, submit flag.

Why **8**? **64/8=8**. Slots **0–7**: **nums**. **8**: **flag**.

Could **store**? Sure, index **8**, write junk to corrupt flag, but we want to read, not wreck.

Advanced twists: If flag longer than **7** bytes (it is, **0x40**), **read** grabs until null. If no null, runs on — potential bigger leak. But **fgets** adds null, so clean.

Joke’s on the binary: It thought hiding the load behind **1337** was clever, but we “ate” the menu and burped out the flag via index. Like ordering off-menu at a drive-thru and getting free fries… except the fries are the flag.

## Step 5: Mitigation Thoughts (Because We’re Pros)

In real world: Add bounds **if(index < 0 || index >= 8) error;**. Use safe functions. But CTF? Nah, vulns are features.

And that’s the deep dive. We exploited OOB to leak the loaded flag, bypassing the password troll. Flag stolen, challenge pwned. If this was a heist movie, we’d be walking away in slow-mo while the binary explodes in confusion. GG!
