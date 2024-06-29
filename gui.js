const nodegui = require('@nodegui/nodegui');
const path = require('path');
const open = require('open');
const childProcess = require('child_process')

const { readConfig } = require('./config.js');

exports.trayIcon = () => {
    const tray = new nodegui.QSystemTrayIcon();

    const trayIcon = new nodegui.QIcon(
        path.resolve(__dirname, "static/pika.png")
    );
    tray.setIcon(trayIcon);
    tray.setToolTip('SM Stream')

    tray.setContextMenu(contextMenu())
    return tray
};

exports.mainWindow = () => {
    const win = new nodegui.QMainWindow();

    const centralWidget = new nodegui.QWidget();
    centralWidget.setObjectName("myroot");
    const rootLayout = new nodegui.FlexLayout();
    centralWidget.setLayout(rootLayout);

    const label = new nodegui.QLabel();
    label.setInlineStyle("font-size: 16px; font-weight: bold;");
    label.setText("SM Stream Tool");

    rootLayout.addWidget(label);
    win.setCentralWidget(centralWidget);
    win.setStyleSheet(
        `
        #myroot {
        background-color: #443344;
        }
    `
    );
    win.setFixedSize(600, 400)
    return win
};

const contextMenu = () => {
    const menu = new nodegui.QMenu();

    //Open web GUI
    const openWeb = new nodegui.QAction();
    let font = new nodegui.QFont()
    font.setBold(true)
    openWeb.setFont(font)
    openWeb.setText("Open web GUI");
    openWeb.addEventListener("triggered", () => {
        open(`http://127.0.0.1:${config.web.port}`)
    })
    menu.addAction(openWeb);

    //Reload config
    const reloadConfig = new nodegui.QAction();
    reloadConfig.setText("Reload config");
    reloadConfig.addEventListener("triggered", () => {
        readConfig(() => {console.log("TODO: do something when config reloaded");})
    });
    menu.addAction(reloadConfig);

    //Show in Explorer
    const openDirectory = new nodegui.QAction();
    openDirectory.setText("Show in Explorer");
    openDirectory.addEventListener("triggered", () => {
        childProcess.exec(`start "" "${__dirname}"`)
    });
    menu.addAction(openDirectory);


    menu.addSeparator()

    //Exit
    const exitProgram = new nodegui.QAction();
    exitProgram.setText("Exit");
    exitProgram.addEventListener("triggered", () => {
        process.exit()
    });
    menu.addAction(exitProgram);

    return menu
}