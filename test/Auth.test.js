const Auth = artifacts.require("Auth");

contract("Auth", function(accounts) {
  let authInstance;

  beforeEach(async function() {
    authInstance = await Auth.new();
  });

  it("should register a user", async function() {
      await authInstance.register(accounts[0], "device1", "192.168.0.1");
      let user = await authInstance.users(accounts[0]);
      assert.equal(user.device, "device1");
      assert.equal(user.ip, "192.168.0.1");
  });

  it("should login a user", async function() {
      await authInstance.register(accounts[0], "device1", "192.168.0.1");
      let isUser = await authInstance.login(accounts[0], "192.168.0.1");
      assert.equal(isUser, true);
  });

  it("should logout a user", async function() {
      await authInstance.register(accounts[0], "device1", "192.168.0.1");
      await authInstance.logout(accounts[0]);
      let isUser = await authInstance.login(accounts[0], "192.168.0.1");
      assert.equal(isUser, false);
  });
it("should fail login with wrong IP", async function() {
    await authInstance.register(accounts[0], "device1", "192.168.0.1");
    let isUser = await authInstance.login(accounts[0], "192.168.0.2");
    assert.equal(isUser, false);
});

it("should inactivate system after two failed login attempts", async function() {
    await authInstance.register(accounts[0], "device1", "192.168.0.1");
    await authInstance.login(accounts[0], "192.168.0.2");
    await authInstance.login(accounts[0], "192.168.0.2");
    let isUser = await authInstance.login(accounts[0], "192.168.0.1");
    assert.equal(isUser, false);
});

it("should store login attempt logs", async function() {
    await authInstance.register(accounts[0], "device1", "192.168.0.1");
    await authInstance.login(accounts[0], "192.168.0.1");
    let logs = await authInstance.loginAttempts(accounts[0]);
    assert.equal(logs.length, 1);
});

it("should inactivate system after two failed login attempts and reactivate after 2 minutes", async function() {
    await authInstance.register(accounts[0], "device1", "192.168.0.1");
    await authInstance.login(accounts[0], "192.168.0.2");
    await authInstance.login(accounts[0], "192.168.0.2");
    let isSystemActive = await authInstance.systemActive();
    assert.equal(isSystemActive, false);
    await new Promise(resolve => setTimeout(resolve, 120000));
    isSystemActive = await authInstance.systemActive();
    assert.equal(isSystemActive, true);
});
});

