export const getDevices = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (d) => d.kind === 'videoinput'
      );
      const audioOutputDevices = devices.filter(
        (d) => d.kind === 'audiooutput'
      );
      const audioInputDevices = devices.filter(
        (d) => d.kind === 'audioinput'
      );
      resolve({
        videoDevices,
        audioOutputDevices,
        audioInputDevices,
      });
    } catch (error) {
      console.log(error);
      reject();
    }
  });
};
