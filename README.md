[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/XA8WACOw)
<svg width="600" height="320" viewBox="0 0 600 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width= "600" height="320" rx="24" fill="#F3F4F6"/>
  <text x="50%" y="25%" text-anchor="middle" fill="#1F2937" font-size="28" font-family="Arial, Helvetica, sans-serif" font-weight="bold" dy=".3em">Adv Web Engineering</text>
  <text x="50%" y="50%" text-anchor="middle" fill="#6366F1" font-size="24" font-family="Arial, Helvetica, sans-serif" font-weight="bold" dy=".3em">Assignment</text>
  <text x="50%" y="70%" text-anchor="middle" fill="#6366F1" font-size="24" font-family="Arial, Helvetica, sans-serif" font-weight="bold" dy=".3em">2025</text>
</svg>

## Core Assignment

You have been provided with a starting project that already has some models and migrations defined. There is in addition a couple of pre made routes that will allow
a user to register and login.

To begin with a description of what is included in your framework:

- [Laravel 12](https://laravel.com/docs)
- A configured github codespace with PHP 8.3, Composer 2.8, node 22.17
- [Livewire](https://livewire.laravel.com/) starter kit (recommended for laravel)
- [TailwindCSS](https://tailwindcss.com/)
- configured for SQLite database access

The following modifications have been made to a Vanilla Laravel starting project

- Course Database Table Added (to hold modules)
- User Role Database Table Added
- User Table modified to have Foreign Key relationship to User Role
- 2 new routes created for login and register that use LiveWire components
- Feature Tests added for these 2 Livewire Components
- A logout component, with Feature Test (made using traditional Laravel Blade)
- Seeders to populate some test data - includes admin user, modules and user roles

## Assignment Brief

The purpose of the assignment is to produce an educational administrative site that has 4 User Types

- Admin
- Teacher
- (Current) Student
- Old Student

Functionally the site needs to do the following:

### Administrator(s)
```
Admin Section (viewed only by administators)
An admin account cannot be created directly – they are added through the seeder
Admin can add a new module
Admin can create / remove teachers
Admin can remove students from a module
Admin can attach a teacher to a module
Admin can change the status of a users to different roles
Admin can toggle modules as being available or unavailable
```

### Teacher(s)
```
Teacher Section (viewed only by Teachers)
Teachers cannot create accounts directly – they are created by admin role
Teachers can view the modules assigned to them by admin
Teachers can view the students attached to the module
Teachers can set a PASS / FAIL to a student for a module. Setting this will timestamp the completion of the module for the student
```

### Student(s) / Old Student(s)
```
Student Section (viewed only by students)
Students can enrol on a maximum of 4 current modules
Students can see a history of completed modules – i.e. this will show a PASS/FAIL history 
Students can see further modules to be enrolled on (if not at their maximum allocation)
Students can sign up to the site
Old Students ONLY see a list of completed modules with their PASS / FAIL status
```

### Module(s)
```
Modules can have a maximum of 10 students attached.
Once the maximum is reached students cannot enrol until existing students complete and a space becomes available
Archiving a modules (make unavailable) doesn’t delete its history, just its availability to new students. i.e. a student should be able to see past performance even if the module is no longer actively taught
Modules should indicate an enrollment date for student starting, pass status and date of completion
```

How you opt to build your site is your choice - but it is expected that migration files are kept as they are. If you want to
change the model in any way then subsequent migrations need to be made that ALTER the table structure. It is also likely that further table(s) may need creating.

LiveWire comes with AlpineJS - this should be the JS used, if opting to build interactivity akin to a single page type application.
[Flux](https://fluxui.dev/) has also been included which does provide some additional components or LiveWire 

### Marking:

Marks in highest category (80%+) will need to have 
- all *features working* 
- *be bug free* 
- *show good design* 
- incorporate *Unit and/or Feature tests*
- *have an appropriate git history that reflects professional development*

An example video showing a site with the above features implemented will be availble through the VLE.

