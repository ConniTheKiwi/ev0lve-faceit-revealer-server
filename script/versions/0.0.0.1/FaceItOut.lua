local api_gateway       = gui.new_textbox("API Gateway", "faceit_dumper_api_gateway")
local api_path          = gui.new_textbox("API Path", "faceit_deumper_api_path")
local apiKey_t          = gui.new_textbox("API Key", "faceit_dumper_apiKey")

local output_in_chat    = gui.new_checkbox("In Chat", "faceit_dumper_in_chat", false)

api_gateway:set_value("http://localhost:80/api/0/faceit")  -- Should be fine on default
api_path:set_value("/userinfo/output")                     -- Should be fine on default
apiKey_t:set_value("FACE IT API KEY") -- Excluding "Bearer " - https://developers.faceit.com/

print("Loaded.")


local ready = false

function on_get(data)
    ready = true
    print(data)
    sendChatMessage(data)
end

function sendChatMessage(dat) 
    if engine_client.is_connected() then
        if engine_client.is_ingame() then
            if dat == "123" then
                print("user doesnt have a faceit account.")
            end

            if dat ~= "NA" then 
                if dat ~= "123" then 
                    if output_in_chat:get_value() then
                        engine_client.exec("say "..dat)
                    end
                end
            end
        end
    end
end

function makeReq(steamID)
    ready = false
    print(steamID)
    http.get(api_gateway:get_value()..api_path:get_value().."?steam_32="..steamID.."&api_key="..apiKey_t:get_value(), on_get)
end

--  function stolen from lobby_chat_spammer
local function new_button(name, callback)
    local cb = gui.new_checkbox(name, name .. "_cb", false)
    cb:set_tooltip("This is a 'button', it doesnt stay on when toggled")
    cb:set_callback(function()
        if cb:get_value() then
            callback(cb)
            cb:set_value(false)
        end
    end)
end

local processing = false
new_button("Everyone test", function(self)
    if processing == true then
        print("Please wait for last scan to finish.")
    end
    if processing == false then
        if engine_client.is_connected()then
            if engine_client.is_ingame() then
                processing = true
                print("-----------------")
                print("Starting scan")
                print("-----------------")
                for i = 1, entity_list.get_highest_index() do
                    if ready == false then
                        i = i - 1
                    end

                    local ent = entity_list.get_entity(i)

                    if ent:is_valid() then
                        local info2 = ent:get_player_info()
                        if info2.steam_id ~= "BOT" then
                            makeReq(info2.steam_id64)
                        end
                    end
                end 
                processing = false
                print("Finished.")
            end
        end
    end
end)