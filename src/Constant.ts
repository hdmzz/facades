import proj4 from "proj4";
proj4.defs("EPSG:32631", "+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs");

// export const center = [4.888824941086167, 45.758442352904346]; //grand clement
export const center = [4.813175220744565, 45.732103733850856]; //confluence
// export const center = [4.8580581340137226, 45.75994571749531]; //part dieu
// [45.801249644849726, 4.976431539088798] //étants
// export const center = [4.976431539088798, 45.801249644849726]; //étants
// [45.81398184047721, 5.034935598315689] //a coté
// export const center = [5.034935598315689, 45.81398184047721]; //a coté
// [45.767845153808594, 4.873825550079346] //SISUU
// export const center = [4.873825550079346, 45.767845153808594]; //SISUU
// [48.85249743686706, 2.336177685378809] //Bonsoir Paris
// export const center = [2.336177685378809, 48.85249743686706]; //Bonsoir Paris
// [45.74836189117593, 4.856314779522218] //Ludo
// export const center = [4.856314779522218, 45.74836189117593]; //Ludo
// export const center = [4.857157298467384, 45.73825578576631]; //Cimetiere
// export const center = [4.913728234508916, 45.65332829375378]; //aerodrome
// export const center = [-0.5259232633597128, 44.32129531348249]; // foret public
// [45.77627919306931, 4.853731395954368] // parc de la tete d'or
// export const center = [4.853731395954368, 45.77627919306931]; // parc de la tete d'or
// [48.636333992114224, -1.5354097547233085] // zone d'estran
// export const center = [-1.5354097547233085, 48.636333992114224]; // zone d'estran
// export const globalOrigin = proj4("EPSG:4326", "EPSG:32631", center);

class StateService {
  private center?: [number, number];

  getCenter() {
    if (!this.center) throw new Error("Center is not set");

    return this.center;
  }

  getGlobalOrigin() {
    if (!this.center) throw new Error("Center is not set");

    return proj4("EPSG:4326", "EPSG:32631", this.center);
  }

  setCenter(center: [number, number]) {
    this.center = center;
  }
}

const instance = new StateService();
export default instance;
