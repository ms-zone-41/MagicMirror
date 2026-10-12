describe("Updatenotification module", () => {
	let updatenotification;
	const lock = { lockString: "module_1_updatenotification" };

	beforeEach(() => {
		global.Module = {
			register: vi.fn((name, moduleDefinition) => {
				updatenotification = moduleDefinition;
			}),
			definitions: {}
		};
		global.Log = {
			info: vi.fn(),
			log: vi.fn(),
			error: vi.fn()
		};

		const defaults = require("../../../../../js/defaults");
		require(`../../../../../${defaults.defaultModulesDir}/updatenotification/updatenotification`);

		updatenotification.config = { ...updatenotification.defaults };
		updatenotification.identifier = "module_1_updatenotification";
		updatenotification.moduleList = {};
		updatenotification.updates = [];
		updatenotification.needRestart = false;
		updatenotification.selfHidden = false;
		updatenotification.updateDom = vi.fn();
		updatenotification.sendSocketNotification = vi.fn();
		updatenotification.hide = vi.fn();
		updatenotification.show = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("hides itself while it has nothing to show, so that it takes no space", () => {
		updatenotification.notificationReceived("DOM_OBJECTS_CREATED");

		expect(updatenotification.hide).toHaveBeenCalledWith(0, expect.any(Function), lock);
		expect(updatenotification.sendSocketNotification).toHaveBeenCalledWith("CONFIG", updatenotification.config);
	});

	it("shows itself while a module is behind and hides itself again when it is up to date", () => {
		updatenotification.notificationReceived("DOM_OBJECTS_CREATED");
		updatenotification.updateUI({ module: "MMM-Example", behind: 2 });
		updatenotification.updateUI({ module: "MagicMirror", behind: 1 });

		expect(updatenotification.show).toHaveBeenCalledTimes(1);
		expect(updatenotification.show).toHaveBeenCalledWith(0, expect.any(Function), lock);

		updatenotification.updateUI({ module: "MMM-Example", behind: 0 });
		expect(updatenotification.hide).toHaveBeenCalledTimes(1);

		updatenotification.updateUI({ module: "MagicMirror", behind: 0 });
		expect(updatenotification.hide).toHaveBeenCalledTimes(2);
		expect(updatenotification.hide).toHaveBeenLastCalledWith(0, expect.any(Function), lock);
	});

	it("shows itself for the result of an update", () => {
		updatenotification.notificationReceived("DOM_OBJECTS_CREATED");
		updatenotification.updatesNotifier({ name: "MMM-Example", updated: true, needRestart: true });

		expect(updatenotification.show).toHaveBeenCalledWith(0, expect.any(Function), lock);
	});
});
