document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger-menu");
    const nav = document.querySelector(".navigation");

    hamburger.addEventListener("click", function () {
        nav.classList.toggle("active");
    });

    document.addEventListener("click", function (event) {
        if (!hamburger.contains(event.target) && !nav.contains(event.target)) {
            nav.classList.remove("active");
        }
    });
});
const currentYear = new Date().getFullYear();
const currentYearElem = document.getElementById("currentyear");
if (currentYearElem) {
    currentYearElem.textContent = currentYear;
}
document.getElementById("lastModified").textContent = `Last modified: ${document.lastModified}`;

document.addEventListener("DOMContentLoaded", () => {
    const courses = [
        {
            subject: 'CSE',
            number: 110,
            title: 'Introduction to Programming',
            credits: 2,
            certificate: 'Web and Computer Programming',
            description: 'This course will introduce students to programming. It will introduce the building blocks of programming languages (variables, decisions, calculations, loops, array, and input/output) and use them to solve problems.',
            technology: [
                'Python'
            ],
            completed: true
        },
        {
            subject: 'WDD',
            number: 130,
            title: 'Web Fundamentals',
            credits: 2,
            certificate: 'Web and Computer Programming',
            description: 'This course introduces students to the World Wide Web and to careers in web site design and development. The course is hands on with students actually participating in simple web designs and programming. It is anticipated that students who complete this course will understand the fields of web design and development and will have a good idea if they want to pursue this degree as a major.',
            technology: [
                'HTML',
                'CSS'
            ],
            completed: true
        },
        {
            subject: 'CSE',
            number: 111,
            title: 'Programming with Functions',
            credits: 2,
            certificate: 'Web and Computer Programming',
            description: 'CSE 111 students become more organized, efficient, and powerful computer programmers by learning to research and call functions written by others; to write, call , debug, and test their own functions; and to handle errors within functions. CSE 111 students write programs with functions to solve problems in many disciplines, including business, physical science, human performance, and humanities.',
            technology: [
                'Python'
            ],
            completed: true
        },
        {
            subject: 'CSE',
            number: 210,
            title: 'Programming with Classes',
            credits: 2,
            certificate: 'Web and Computer Programming',
            description: 'This course will introduce the notion of classes and objects. It will present encapsulation at a conceptual level. It will also work with inheritance and polymorphism.',
            technology: [
                'C#'
            ],
            completed: true
        },
        {
            subject: 'WDD',
            number: 131,
            title: 'Dynamic Web Fundamentals',
            credits: 2,
            certificate: 'Web and Computer Programming',
            description: 'This course builds on prior experience in Web Fundamentals and programming. Students will learn to create dynamic websites that use JavaScript to respond to events, update content, and create responsive user experiences.',
            technology: [
                'HTML',
                'CSS',
                'JavaScript'
            ],
            completed: true
        },
        {
            subject: 'WDD',
            number: 231,
            title: 'Frontend Web Development I',
            credits: 2,
            certificate: 'Web and Computer Programming',
            description: 'This course builds on prior experience with Dynamic Web Fundamentals and programming. Students will focus on user experience, accessibility, compliance, performance optimization, and basic API usage.',
            technology: [
                'HTML',
                'CSS',
                'JavaScript'
            ],
            completed: false
        }
    ]

    const certificateSection = document.querySelector(".section-full");

    if (!certificateSection) {
        console.error("Container with ID 'section-full' not found.");
        return;
    }


    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";
    certificateSection.appendChild(buttonContainer);


    const categories = ["All", "WDD", "CSE"];
    categories.forEach(category => {
        const button = document.createElement("button");
        button.textContent = `${category}`;
        button.dataset.category = category;
        buttonContainer.appendChild(button);

    });

    const lineContainer = document.createElement("div");
    lineContainer.id = "lineContainer";
    certificateSection.appendChild(lineContainer);

    const courseContainer = document.createElement("div");
    courseContainer.id = "courseContainer";
    certificateSection.appendChild(courseContainer);


    const totalCredits = document.createElement("p");
    totalCredits.id = "totalCredits";
    certificateSection.appendChild(totalCredits);


    function renderCourses(courseList) {
        courseContainer.innerHTML = "";

        courseList.forEach(course => {
            const courseCard = document.createElement("div");
            courseCard.className = course.completed ? "course completed" : "course";
            courseCard.innerHTML = `
                <h3>${course.subject} ${course.number}</h3>
                
                
            `;
            courseContainer.appendChild(courseCard);
        });


        const totalCreditsValue = courseList.reduce((sum, course) => sum + course.credits, 0);
        totalCredits.textContent = `Total Credits: ${totalCreditsValue}`;
    }


    function filterCourses(category) {
        const filteredCourses = category === "All" ? courses : courses.filter(course => course.subject === category);
        renderCourses(filteredCourses);
    }


    function setActiveButton(selectedButton) {
        document.querySelectorAll(".button-container button").forEach(btn => {
            btn.classList.remove("active");
        });

        selectedButton.classList.add("active");
        filterCourses(selectedButton.dataset.category);
    }


    document.querySelectorAll(".button-container button").forEach(button => {
        button.addEventListener("click", function () {
            setActiveButton(this);
        });
    });


    renderCourses(courses);
});


