### Cloud Print Project

#### Introduction:

Initiating a 3D print on an older 3D printer requires several steps: saving the 3D file to an SD card, inserting the card into the printer, adjusting settings on the built-in screen, manually monitoring the print, and waiting for completion. The project aims to develop and implement a wireless solution for 3D printers, enabling remote monitoring and control of the printing process through an intuitive user interface. By leveraging modern technologies such as Raspberry Pi, Python, AWS (Amazon Web Services), and Cloudflare, the project aims to enhance user experience and printing efficiency.

#### Benefits:

The proposed solution offers benefits such as wirelessly sending files to the printer via Wi-Fi, monitoring the printing process via a webcam, wireless printer calibration, increasing print speed by up to 70% through techniques like "Input shaping," improving print quality with Raspberry Pi's CPU and RAM, and interacting with AI for advice and tips on 3D printing.

#### Target Audience:

The application targets all 3D printer owners and users, regardless of experience level, aiming to make 3D printing easier, faster, and more convenient by integrating modern technologies and smart solutions. The audience includes hobbyists exploring 3D printing as a creative hobby, professionals using 3D printers for prototypes and manufacturing, as well as educators and students utilizing the technology for educational purposes.

#### How It Works:

Visitors can open the webpage in their browser and access the ability to add a printer by simply entering its IP address. After this step, users are prompted to either log in if they already have an account or register if they are new users. They are then presented with an overview of all temperature sensors and relevant information about the printer, including its connection status and actions to be taken in case of connection problems. For users needing additional assistance, there is the option to interact with Smokey the AI, where all questions can be asked and answered. More detailed information about Smokey will be provided later.

### First Connection: 3D Printer to Raspberry Pi

#### Configuration of 3D Printer with Klipper:

To improve the functionality and performance of the 3D printer, I chose to integrate it with a Raspberry Pi, providing it with increased intelligence and functionality. This can be likened to adding an intelligent central unit to the printer, enabling communication with other devices such as computers or smartphones. The decision to integrate Raspberry Pi is based on my interest in using sophisticated software called Klipper, which aims to improve the printer's speed and precision.

To implement Klipper on the printer, the following steps were taken:

1. **Preparation of Tools and Software:** Klipper software was downloaded, and access to necessary tools such as an STLink and various cables was ensured.

2. **Physical Connection of STLink to Printer's Circuit Board:** The STLink was physically connected to the printer's circuit board using appropriate cables, enabling communication between the printer and my computer.

3. **Creation of Binary and Hex Files for Klipper:** Before implementing Klipper, it was necessary to generate files compatible with the printer's hardware and software.

   - **Compilation of Klipper for the Specific 3D Printer:** I navigated to the Klipper code location via the terminal and used the 'make menuconfig' command to configure Klipper according to the printer's specifications.

   - **Configuration of Klipper for the Printer:** The settings in Klipper's configuration interface were adjusted to match the printer's requirements and characteristics.

   - **Compilation of Klipper:** After the settings were correct, the 'make' command was used to compile Klipper and prepare it for use with the printer.

   - **Creation of Hex File for Firmware Flashing:** Using the 'scripts/klipper_mcu_install.py' tool, a specific hex file required for making the printer intelligent was generated.

4. **Transfer of Files to Printer's Circuit Board with TPLINK and USB Flashing:** The printer's circuit board was connected to my computer via a USB cable, and the TPLINK application was used to smoothly transfer the previously created files.

5. **Flashing Firmware on Control Unit with USB Flashing:** Finally, the printer's firmware was updated with the generated hex file, allowing the printer to take advantage of Klipper's advanced features and benefits.

#### Configuration of Raspberry Pi with Klipper:

After connecting the 3D printer to the Raspberry Pi and installing Klipper, the next step was to ensure smooth integration. The following steps were taken:

1. **Preparation of Tools and Software:** Raspberry Pi was updated to the latest software version, and internet connectivity was ensured.

2. **Installation of Additional Software:** To enable efficient communication between the Raspberry Pi and 3D printer via Klipper, additional programs including Moonraker were installed.

3. **Configuration of Klipper:** The configuration file for Klipper on Raspberry Pi was adjusted according to the printer's requirements, including adjustments related to stepper motors' movements and temperature measurement.

4. **Testing and Troubleshooting:** All settings were carefully tested to ensure correct functionality and avoid any inaccuracies or collisions.

Now, a Klipper server with several useful endpoints is available on localhost. By sending requests to Klipper's endpoints using the Postman tool, motors can be controlled and sensors monitored. It is satisfying to have such a degree of control over the process.

### Second Connection: Klipper API to Cloud

Here, there were significant changes in the plan. Originally, I considered creating a site-to-site connection in AWS. This involved using the following services on AWS:

- EC2 (costs per hour)
- VPC (Virtual Private Cloud) (costs per month)
- Customer Gateway (Free)
- VPN Connection (I considered OpenSwan) (Free open-source)
- Site-to-Site Connection (data transfer costs)

The costs were high, and AWS data transfer is relatively expensive and exceeds the project's budget, which aims to develop a cost-effective and entertaining solution.

Instead, I chose to use Cloudflare, which is free but requires a domain that I could purchase for only 7 kr per year.

Plan here is to create a secure connection to my printer that I can access outside of my private home network. Cloudflare offers such a service for free, and the following steps will be described step by step.

#### Create a Cloudflare Tunnel:

A terminal window was opened on the computer, and navigation was done to the location where the Cloudflare CLI tool was installed. Then, the command 'cloudflared tunnel create' was used to generate a new tunnel, followed by following the instructions on the screen to specify the tunnel's name and configuration.

After the tunnel was created, it was initiated with the command 'cloudflared tunnel run <tunnel name>'. This action allows Cloudflare to handle all traffic directed to the local network, ensuring its security and efficiency regardless of geographical location. Additionally, an SSL certification and HTTPS encryption are provided to further enhance security and integrity.

#### CORS Config:

CORS (Cross-Origin Resource Sharing) is an important security measure implemented to prevent browsers from allowing requests from domains other than the current one. In my Klipper server, I handled this by editing the server's configuration file. By adding specific domains to the configuration file, I can now allow connections to API endpoints from these domains. This way, my Klipper server can be smoothly integrated with various web applications, even if they are on different domains.

#### Smokey AI:

Ollama is a tool that enables running large language models locally on a computer. This means that users can take advantage of powerful language models directly on their own computer using graphics processors, without relying on internet connectivity. With Ollama, users can create their own models based on existing models and specify instructions for how the model should function and behave. This includes customizing the model's behavior, naming, and response patterns. Smokey is made up of a language model called Mistral. A really large language model that is 7.3B, running on my gaming computer.
Due to CORS, Smokey cannot be allowed to send info outside the local network where it's hosted. A Python server is needed here to allow CORS and enable communication with Smokey and send responses to the user. One can create a profile of this that has a name and instructions on how it should respond and act.

#### FrontEnd:

HTML, CSS, JS are used here to make the experience more personal and everything the user does will stay on their browser. By avoiding external dependencies like React, you can see that the page is lightweight and does not rely on an external server to store or process user information.

The interface contains all printer functionality, as well as a terminal where you get all the responses from the printer, and it also works if you want to send your own G-code to the printer.
You register a 3D printer by entering the Klipper IP address, which will be saved in the browser's memory, and then you log in and get a JWT token that will be saved in the browser's memory, using JS “LocalStorage”. A token is valid for an hour, and then you need to log in again.
When you move to Smokey AI to get help, the user's text is sent via a tunnel to a Python server which in turn sends the text to the Ollama model called Smokey and then sends the response back to the user.

Updating Klipper and Moonraker will be done via buttons in the interface, and the page itself has a pipeline to fetch the latest update from GitHub.


![Cloud Print Project](PowerPoint/Diag.png)
